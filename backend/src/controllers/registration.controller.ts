import type { Response } from "express";
import { defaultEvents } from "../data/default-events.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { createBibNumber } from "../services/bib.service.js";
import {
  createCertificateNumber,
  createCertificateQrPayload,
} from "../services/certificate.service.js";
import { ensureDefaultEvents, isRegistrationOpen } from "../services/event.service.js";
import { upsertUserFromClerk } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import {
  createRegistrationSchema,
  reviewProofSchema,
  submitProofSchema,
} from "../validators/registration.validator.js";

export async function createRegistration(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(createRegistrationSchema, request);
  await ensureDefaultEvents();

  let event = payload.eventId
    ? await prisma.event.findUnique({ where: { id: payload.eventId } })
    : await prisma.event.findUnique({ where: { slug: payload.eventSlug } });

  if (!event && payload.eventSlug) {
    const defaultEvent = defaultEvents.find((item) => item.slug === payload.eventSlug);
    if (defaultEvent) {
      event = await prisma.event.upsert({
        where: { slug: defaultEvent.slug },
        create: defaultEvent,
        update: defaultEvent,
      });
    }
  }

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (!isRegistrationOpen(event)) {
    throw new ApiError(
      422,
      event.status === "COMPLETED" || event.endsAt.getTime() < Date.now()
        ? "This event has already ended. Registration is closed."
        : "Registration is not open for this event.",
    );
  }

  if (!event.distances.includes(payload.distance)) {
    throw new ApiError(422, "Selected distance is not available for this event");
  }

  const availableTypes = event.activityTypes.length > 0 ? event.activityTypes : ["running"];
  const selectedType = payload.activityType ?? "running";
  if (!availableTypes.includes(selectedType)) {
    throw new ApiError(422, "Selected activity type is not available for this event");
  }

  if (event.maxCapacity != null) {
    const filled = await prisma.registration.count({
      where: {
        eventId: event.id,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED"] },
      },
    });
    if (filled >= event.maxCapacity) {
      throw new ApiError(422, "This event is full. Registration is closed.");
    }
  }

  const clerkId = payload.clerkId ?? request.auth?.userId;
  const email = payload.email?.toLowerCase();

  let user = null;

  if (clerkId) {
    user = await upsertUserFromClerk({
      clerkId,
      email,
      name: payload.name ?? payload.shippingName,
      phone: payload.phone ?? payload.shippingPhone,
      username: payload.username,
    });
  } else if (payload.userId) {
    user = await prisma.user.findUnique({ where: { id: payload.userId } });
  } else if (email) {
    user = await prisma.user.upsert({
      where: { email },
      create: {
        name: payload.name ?? payload.shippingName,
        email,
        phone: payload.phone ?? payload.shippingPhone,
        username: payload.username,
      },
      update: {
        name: payload.name ?? payload.shippingName,
        phone: payload.phone ?? payload.shippingPhone,
        username: payload.username,
      },
    });
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Unique key is (userId + eventId + distance) — other events/distances are always allowed.
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      userId_eventId_distance: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
      },
    },
    include: { event: true, user: true, payment: true },
  });

  if (existingRegistration) {
    // Resume unpaid checkout for the exact same event + distance only.
    if (
      existingRegistration.status === "PENDING_PAYMENT" ||
      existingRegistration.payment?.status === "CREATED"
    ) {
      response.status(200).json({
        data: existingRegistration,
        meta: {
          freeEntry: false,
          resumed: true,
          message: `Resuming payment for ${event.title} (${payload.distance}).`,
        },
      });
      return;
    }

    throw new ApiError(
      409,
      `You are already registered for ${payload.distance} in “${event.title}”. Pick another distance or a different event.`,
    );
  }

  const freeEntry = !event.paymentRequired || event.priceInPaise <= 0;

  let registration;
  try {
    registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
        activityType: selectedType,
        status: freeEntry ? "CONFIRMED" : "PENDING_PAYMENT",
        shippingName: payload.shippingName,
        shippingPhone: payload.shippingPhone,
        shippingLine1: payload.shippingLine1,
        shippingLine2: payload.shippingLine2,
        shippingCity: payload.shippingCity,
        shippingState: payload.shippingState,
        shippingPincode: payload.shippingPincode,
        bibNumber: createBibNumber(event.slug),
      },
      include: {
        event: true,
        user: true,
        payment: true,
      },
    });
  } catch (error) {
    // Race / unique collision → re-read and resume if pending
    const raced = await prisma.registration.findUnique({
      where: {
        userId_eventId_distance: {
          userId: user.id,
          eventId: event.id,
          distance: payload.distance,
        },
      },
      include: { event: true, user: true, payment: true },
    });
    if (raced && (raced.status === "PENDING_PAYMENT" || raced.payment?.status === "CREATED")) {
      response.status(200).json({
        data: raced,
        meta: { freeEntry: false, resumed: true },
      });
      return;
    }
    if (raced) {
      throw new ApiError(
        409,
        `You are already registered for ${payload.distance} in “${event.title}”.`,
      );
    }
    throw error;
  }

  // Apply referral code if provided
  if (payload.referralCode && user.clerkId) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: payload.referralCode.toUpperCase() } });
    if (referrer && referrer.id !== user.id) {
      const existingRef = await prisma.referral.findUnique({ where: { refereeId: user.id } });
      if (!existingRef) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
            code: payload.referralCode.toUpperCase(),
            status: freeEntry ? "converted" : "pending",
          },
        });
      }
    }
  }

  response.status(201).json({ data: registration, meta: { freeEntry } });
}

export async function submitProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(submitProofSchema, request);
  const registrationId = routeParam(request, "id");

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: true,
      payment: true,
      proofUpload: true,
      event: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  // Ownership: signed-in Clerk user must own this registration (when Clerk is on).
  const clerkId = request.auth?.userId;
  if (clerkId && existing.user.clerkId && existing.user.clerkId !== clerkId) {
    throw new ApiError(403, "You can only submit proof for your own registration");
  }

  const isPaid =
    existing.status === "CONFIRMED" ||
    existing.status === "COMPLETED" ||
    existing.payment?.status === "PAID" ||
    !existing.event.paymentRequired ||
    existing.event.priceInPaise <= 0;

  if (!isPaid) {
    throw new ApiError(422, "Complete payment before uploading GPS proof");
  }

  if (existing.proofStatus === "APPROVED") {
    throw new ApiError(409, "Proof already approved. Contact support to re-submit.");
  }

  if (existing.proofStatus === "SUBMITTED") {
    throw new ApiError(
      409,
      "Proof already submitted and waiting for review. You can re-upload only after rejection.",
    );
  }

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: "SUBMITTED",
      finishTimeSeconds: payload.finishTimeSeconds ?? existing.finishTimeSeconds,
      proofUpload: {
        upsert: {
          create: {
            activityImageUrl: payload.activityImageUrl,
            sourceApp: payload.sourceApp,
            status: "SUBMITTED",
          },
          update: {
            activityImageUrl: payload.activityImageUrl,
            sourceApp: payload.sourceApp,
            submittedAt: new Date(),
            status: "SUBMITTED",
            reviewerNote: null,
            reviewedAt: null,
          },
        },
      },
    },
    include: { proofUpload: true, event: true },
  });

  response.json({
    data: registration,
    meta: {
      message: "Proof submitted. Our team will review it for leaderboard and certificate.",
    },
  });
}

export async function reviewProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(reviewProofSchema, request);
  const registrationId = routeParam(request, "id");
  const status = payload.approved ? "APPROVED" : "REJECTED";

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: status,
      finishTimeSeconds: payload.finishTimeSeconds,
      proofUpload: {
        update: {
          status,
          reviewerNote: payload.reviewerNote,
          reviewedAt: new Date(),
        },
      },
    },
  });

  if (payload.approved) {
    const certificateNumber = createCertificateNumber(registration.bibNumber);
    await prisma.certificate.upsert({
      where: { registrationId },
      create: {
        registrationId,
        certificateNumber,
        qrPayload: createCertificateQrPayload(certificateNumber),
        status: "QUEUED",
      },
      update: {
        status: "QUEUED",
      },
    });

    await prisma.medalDelivery.upsert({
      where: { registrationId },
      create: { registrationId, status: "PENDING" },
      update: { status: "PENDING" },
    });
  }

  response.json({ data: registration });
}

export async function getLeaderboard(request: AuthenticatedRequest, response: Response) {
  const eventKey = routeParam(request, "eventId");
  const distance =
    typeof request.query.distance === "string" && request.query.distance.trim()
      ? request.query.distance.trim()
      : undefined;

  await ensureDefaultEvents();

  // Accept either event id or slug
  const event = await prisma.event.findFirst({
    where: {
      OR: [{ id: eventKey }, { slug: eventKey }],
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const registrations = await prisma.registration.findMany({
    where: {
      eventId: event.id,
      proofStatus: "APPROVED",
      finishTimeSeconds: { not: null },
      ...(distance ? { distance } : {}),
    },
    orderBy: { finishTimeSeconds: "asc" },
    include: { user: true, event: true },
    take: 100,
  });

  response.json({
    data: registrations.map((registration, index) => ({
      rank: index + 1,
      runnerName: registration.user.name,
      distance: registration.distance,
      finishTimeSeconds: registration.finishTimeSeconds,
      bibNumber: registration.bibNumber,
      userId: registration.user.id,
      clerkId: registration.user.clerkId,
      status: "Verified" as const,
    })),
    meta: {
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      distance: distance ?? null,
      total: registrations.length,
    },
  });
}
