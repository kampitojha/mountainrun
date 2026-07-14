import type { Response } from "express";
import { defaultEvents } from "../data/default-events.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { createBibNumber } from "../services/bib.service.js";
import {
  createCertificateNumber,
  createCertificateQrPayload,
} from "../services/certificate.service.js";
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

  if (!event.distances.includes(payload.distance)) {
    throw new ApiError(422, "Selected distance is not available for this event");
  }

  const clerkId = payload.clerkId ?? request.auth?.userId;
  const email = payload.email?.toLowerCase();

  let user = null;

  if (clerkId) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: user.clerkId ?? clerkId,
          name: payload.name ?? payload.shippingName,
          phone: payload.phone ?? payload.shippingPhone,
          ...(email ? { email } : {}),
        },
      });
    } else if (email) {
      user = await prisma.user.create({
        data: {
          clerkId,
          name: payload.name ?? payload.shippingName,
          email,
          phone: payload.phone ?? payload.shippingPhone,
        },
      });
    }
  } else if (payload.userId) {
    user = await prisma.user.findUnique({ where: { id: payload.userId } });
  } else if (email) {
    user = await prisma.user.upsert({
      where: { email },
      create: {
        name: payload.name ?? payload.shippingName,
        email,
        phone: payload.phone ?? payload.shippingPhone,
      },
      update: {
        name: payload.name ?? payload.shippingName,
        phone: payload.phone ?? payload.shippingPhone,
      },
    });
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingRegistration = await prisma.registration.findUnique({
    where: {
      userId_eventId_distance: {
        userId: user.id,
        eventId: event.id,
        distance: payload.distance,
      },
    },
  });

  if (existingRegistration) {
    if (existingRegistration.status === "PENDING_PAYMENT") {
      const registration = await prisma.registration.findUnique({
        where: { id: existingRegistration.id },
        include: { event: true, user: true, payment: true },
      });
      response.status(200).json({ data: registration });
      return;
    }

    throw new ApiError(409, "You are already registered for this distance in this event.");
  }

  const registration = await prisma.registration.create({
    data: {
      userId: user.id,
      eventId: event.id,
      distance: payload.distance,
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
    },
  });

  response.status(201).json({ data: registration });
}

export async function submitProof(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(submitProofSchema, request);
  const registrationId = routeParam(request, "id");

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      proofStatus: "SUBMITTED",
      finishTimeSeconds: payload.finishTimeSeconds,
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
          },
        },
      },
    },
    include: { proofUpload: true },
  });

  response.json({ data: registration });
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
  const eventId = routeParam(request, "eventId");
  const registrations = await prisma.registration.findMany({
    where: {
      eventId,
      proofStatus: "APPROVED",
      finishTimeSeconds: { not: null },
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
    })),
  });
}
