import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";

type PrizeStatus = "pending" | "processing" | "ready" | "sent" | "dispatched" | "delivered" | "not_eligible";

type PrizeItem = {
  type: string;
  name: string;
  icon: string;
  status: PrizeStatus;
  statusLabel: string;
  tracking?: { courier: string; number: string; url: string } | null;
  action?: { label: string; href: string } | null;
};

type TimelineStage = {
  stage: "registered" | "paid" | "proof_submitted" | "proof_approved" | "prizes";
  label: string;
  date: string | null;
  done: boolean;
};

function getPrizeStatus(medalStatus: string | null, certificateStatus: string | null, type: string): { status: PrizeStatus; statusLabel: string } {
  if (type === "certificate") {
    if (certificateStatus === "SENT") return { status: "sent", statusLabel: "Emailed" };
    if (certificateStatus === "GENERATED") return { status: "ready", statusLabel: "Ready" };
    if (certificateStatus === "QUEUED") return { status: "processing", statusLabel: "Processing" };
    return { status: "pending", statusLabel: "After verification" };
  }
  if (type === "medal") {
    if (medalStatus === "DELIVERED") return { status: "delivered", statusLabel: "Delivered" };
    if (medalStatus === "DISPATCHED") return { status: "dispatched", statusLabel: "On the way" };
    if (medalStatus === "PENDING") return { status: "processing", statusLabel: "Preparing" };
    if (medalStatus === "NOT_ELIGIBLE") return { status: "not_eligible", statusLabel: "Not eligible" };
    return { status: "pending", statusLabel: "After verification" };
  }
  return { status: "pending", statusLabel: "Pending" };
}

function buildTimeline(
  registeredAt: Date,
  paymentStatus: string | null,
  proofStatus: string,
  hasPrizes: boolean,
): TimelineStage[] {
  return [
    { stage: "registered", label: "Registration confirmed", date: registeredAt.toISOString(), done: true },
    { stage: "paid", label: "Payment completed", date: paymentStatus === "PAID" ? registeredAt.toISOString() : null, done: paymentStatus === "PAID" },
    { stage: "proof_submitted", label: "GPS proof submitted", date: null, done: proofStatus !== "NOT_SUBMITTED" },
    { stage: "proof_approved", label: "Proof verified", date: null, done: proofStatus === "APPROVED" },
    { stage: "prizes", label: "Prizes dispatched", date: null, done: hasPrizes },
  ];
}

function buildPrizeItems(
  benefits: string[],
  medalStatus: string | null,
  certificateStatus: string | null,
  medalTracking: { courier: string | null; trackingNumber: string | null; trackingUrl: string | null } | null,
  certificateNumber: string | null,
): PrizeItem[] {
  const items: PrizeItem[] = [];

  // Certificate always comes first
  const certStatus = getPrizeStatus(null, certificateStatus, "certificate");
  items.push({
    type: "certificate",
    name: "E-Certificate",
    icon: "certificate",
    ...certStatus,
    action: certificateStatus && certificateStatus !== "QUEUED" && certificateNumber
      ? { label: "View certificate", href: `/certificates/${certificateNumber}` }
      : null,
  });

  // Medal if in benefits or medalIncluded
  const hasMedal = benefits.some((b) => b.toLowerCase().includes("medal")) || medalStatus !== null;
  if (hasMedal) {
    const medalInfo = getPrizeStatus(medalStatus, null, "medal");
    items.push({
      type: "medal",
      name: "Finisher Medal",
      icon: "medal",
      ...medalInfo,
      tracking: medalTracking?.trackingNumber
        ? { courier: medalTracking.courier ?? "Courier", number: medalTracking.trackingNumber, url: medalTracking.trackingUrl ?? "" }
        : null,
      action: medalTracking?.trackingUrl
        ? { label: "Track package", href: medalTracking.trackingUrl }
        : medalStatus === "DELIVERED" && medalTracking?.trackingNumber
          ? { label: "Track package", href: medalTracking.trackingUrl ?? "#" }
          : null,
    });
  }

  // T-shirt if in benefits
  const hasTshirt = benefits.some((b) => b.toLowerCase().includes("shirt") || b.toLowerCase().includes("tshirt") || b.toLowerCase().includes("t-shirt") || b.toLowerCase().includes("merch"));
  if (hasTshirt) {
    items.push({
      type: "tshirt",
      name: "Event T-Shirt",
      icon: "tshirt",
      status: medalStatus === "DISPATCHED" || medalStatus === "DELIVERED" ? "processing" as PrizeStatus : "pending" as PrizeStatus,
      statusLabel: medalStatus === "DISPATCHED" || medalStatus === "DELIVERED" ? "Preparing" : "After verification",
    });
  }

  return items;
}

export async function lookupPrizeByBib(request: AuthenticatedRequest, response: Response) {
  const bibNumber = routeParam(request, "bibNumber");

  const registration = await prisma.registration.findFirst({
    where: { bibNumber },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true, slug: true, distances: true, benefits: true } },
      payment: { select: { status: true } },
      certificate: true,
      medalDelivery: true,
    },
  });

  if (!registration) {
    throw new ApiError(404, "No registration found with this bib number");
  }

  const prizes = buildPrizeItems(
    registration.event.benefits,
    registration.medalDelivery?.status ?? null,
    registration.certificate?.status ?? null,
    registration.medalDelivery
      ? { courier: registration.medalDelivery.courier, trackingNumber: registration.medalDelivery.trackingNumber, trackingUrl: registration.medalDelivery.trackingUrl }
      : null,
    registration.certificate?.certificateNumber ?? null,
  );

  const hasPrizes = prizes.some((p) => p.status !== "pending" && p.status !== "not_eligible");

  const timeline = buildTimeline(
    registration.registeredAt,
    registration.payment?.status ?? null,
    registration.proofStatus,
    hasPrizes,
  );

  response.json({
    data: {
      runner: {
        name: registration.shippingName || registration.user.name,
        bibNumber: registration.bibNumber,
      },
      event: {
        title: registration.event.title,
        slug: registration.event.slug,
        distance: registration.distance,
      },
      timeline,
      prizes,
    },
  });
}

export async function myPrizes(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth?.userId;
  if (!clerkId) throw new ApiError(401, "Not authenticated");

  const user = await prisma.user.findFirst({ where: { clerkId } });
  if (!user) throw new ApiError(404, "User not found");

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { registeredAt: "desc" },
    include: {
      event: { select: { title: true, slug: true, distances: true, benefits: true } },
      payment: { select: { status: true } },
      certificate: true,
      medalDelivery: true,
    },
  });

  const data = registrations.map((reg) => {
    const prizes = buildPrizeItems(
      reg.event.benefits,
      reg.medalDelivery?.status ?? null,
      reg.certificate?.status ?? null,
      reg.medalDelivery
        ? { courier: reg.medalDelivery.courier, trackingNumber: reg.medalDelivery.trackingNumber, trackingUrl: reg.medalDelivery.trackingUrl }
        : null,
      reg.certificate?.certificateNumber ?? null,
    );

    const hasPrizes = prizes.some((p) => p.status !== "pending" && p.status !== "not_eligible");
    const timeline = buildTimeline(reg.registeredAt, reg.payment?.status ?? null, reg.proofStatus, hasPrizes);

    return {
      registrationId: reg.id,
      event: {
        title: reg.event.title,
        slug: reg.event.slug,
        distance: reg.distance,
      },
      timeline,
      prizes,
    };
  });

  response.json({ data });
}

export async function getWinnerClaimDetails(request: AuthenticatedRequest, response: Response) {
  const rawBib = routeParam(request, "bibNumber");
  const bibNumber = rawBib?.trim();

  if (!bibNumber) {
    throw new ApiError(400, "BIB number is required");
  }

  const registration = await prisma.registration.findFirst({
    where: {
      bibNumber: {
        equals: bibNumber,
        mode: "insensitive",
      },
    },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      event: { select: { id: true, title: true, slug: true, distances: true } },
    },
  });

  if (!registration) {
    throw new ApiError(404, "No registration found with BIB number " + bibNumber);
  }

  // Calculate official rank in category
  const categoryFinishers = await prisma.registration.findMany({
    where: {
      eventId: registration.eventId,
      distance: registration.distance,
      proofStatus: "APPROVED",
    },
    orderBy: {
      finishTimeSeconds: "asc",
    },
    select: {
      id: true,
      bibNumber: true,
      finishTimeSeconds: true,
    },
  });

  const finisherIndex = categoryFinishers.findIndex((f) => f.id === registration.id);
  let rankLabel = "Official Finisher";
  if (finisherIndex === 0) rankLabel = "🥇 1st Place (Winner)";
  else if (finisherIndex === 1) rankLabel = "🥈 2nd Place";
  else if (finisherIndex === 2) rankLabel = "🥉 3rd Place";
  else if (finisherIndex > 2) rankLabel = `#${finisherIndex + 1} Podium Finisher`;

  // Format finish time
  const sec = registration.finishTimeSeconds;
  let formattedTime = "Verified Finisher";
  if (sec && sec > 0) {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  }

  response.json({
    data: {
      registrationId: registration.id,
      bibNumber: registration.bibNumber,
      runnerName: registration.shippingName || registration.user.name,
      userEmail: registration.user.email,
      phone: registration.shippingPhone || registration.user.phone,
      eventTitle: registration.event.title,
      eventSlug: registration.event.slug,
      category: registration.distance,
      rank: rankLabel,
      finishTime: formattedTime,
      tshirtSize: (registration as any).tshirtSize ?? null,
      tshirtSubmittedAt: (registration as any).tshirtSubmittedAt ?? null,
      shipping: {
        name: registration.shippingName,
        phone: registration.shippingPhone,
        line1: registration.shippingLine1,
        line2: registration.shippingLine2 || "",
        city: registration.shippingCity,
        state: registration.shippingState,
        pincode: registration.shippingPincode,
      },
    },
  });
}

export async function submitWinnerClaim(request: AuthenticatedRequest, response: Response) {
  const rawBib = routeParam(request, "bibNumber");
  const bibNumber = rawBib?.trim();

  if (!bibNumber) {
    throw new ApiError(400, "BIB number is required");
  }

  const {
    tshirtSize,
    shippingName,
    shippingPhone,
    shippingLine1,
    shippingLine2,
    shippingCity,
    shippingState,
    shippingPincode,
  } = request.body || {};

  const validSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  const cleanSize = typeof tshirtSize === "string" ? tshirtSize.trim().toUpperCase() : "";

  if (!cleanSize || !validSizes.includes(cleanSize)) {
    throw new ApiError(400, "Please select a valid T-Shirt size: S, M, L, XL, XXL");
  }

  const registration = await prisma.registration.findFirst({
    where: {
      bibNumber: {
        equals: bibNumber,
        mode: "insensitive",
      },
    },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } },
    },
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found with BIB number " + bibNumber);
  }

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: {
      tshirtSize: cleanSize,
      tshirtSubmittedAt: new Date(),
      ...(shippingName && typeof shippingName === "string" ? { shippingName: shippingName.trim() } : {}),
      ...(shippingPhone && typeof shippingPhone === "string" ? { shippingPhone: shippingPhone.trim() } : {}),
      ...(shippingLine1 && typeof shippingLine1 === "string" ? { shippingLine1: shippingLine1.trim() } : {}),
      ...(shippingLine2 !== undefined && typeof shippingLine2 === "string" ? { shippingLine2: shippingLine2.trim() } : {}),
      ...(shippingCity && typeof shippingCity === "string" ? { shippingCity: shippingCity.trim() } : {}),
      ...(shippingState && typeof shippingState === "string" ? { shippingState: shippingState.trim() } : {}),
      ...(shippingPincode && typeof shippingPincode === "string" ? { shippingPincode: shippingPincode.trim() } : {}),
    } as any,
  });

  // Trigger admin alert via Telegram
  try {
    const { sendTelegramAlert } = await import("../services/alert.service.js");
    await sendTelegramAlert({
      title: "👕 T-Shirt Size Submitted!",
      level: "INFO",
      service: "TshirtClaim",
      message: `<b>${updated.shippingName}</b> (BIB: <code>${updated.bibNumber}</code>) submitted T-Shirt Size: <b>${cleanSize}</b>\n\n<b>Event:</b> ${registration.event.title}\n<b>Category:</b> ${registration.distance}\n<b>Shipping to:</b> ${updated.shippingLine1}, ${updated.shippingCity}, ${updated.shippingState} - ${updated.shippingPincode}\n<b>Phone:</b> ${updated.shippingPhone}`,
    });
  } catch (err) {
    console.warn("Could not send Telegram notification for t-shirt claim:", err);
  }

  response.json({
    success: true,
    message: "T-Shirt size confirmed successfully!",
    data: {
      bibNumber: updated.bibNumber,
      tshirtSize: (updated as any).tshirtSize,
      tshirtSubmittedAt: (updated as any).tshirtSubmittedAt,
    },
  });
}
