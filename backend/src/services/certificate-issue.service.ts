import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import {
  buildCertificatePublicUrl,
  createCertificateNumber,
  createCertificateQrPayload,
  toCertificateRenderData,
} from "./certificate.service.js";
import { sendCertificateEmail } from "./email.service.js";

const certificateInclude = {
  registration: {
    include: {
      user: true,
      event: true,
    },
  },
} as const;

export async function ensureCertificateForRegistration(registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { certificate: true, event: true },
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  if (registration.certificate) {
    return registration.certificate;
  }

  const certificateNumber = createCertificateNumber(registration.bibNumber);
  return prisma.certificate.create({
    data: {
      registrationId,
      certificateNumber,
      qrPayload: createCertificateQrPayload(certificateNumber),
      status: "QUEUED",
    },
  });
}

/** Marks certificate GENERATED and sets public verify URL as pdfUrl. Idempotent. */
export async function generateCertificate(certificateId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: certificateInclude,
  });

  if (!existing) {
    throw new ApiError(404, "Certificate not found");
  }

  const issuedAt = existing.issuedAt ?? new Date();
  const pdfUrl = buildCertificatePublicUrl(existing.certificateNumber);

  return prisma.certificate.update({
    where: { id: certificateId },
    data: {
      status: existing.status === "SENT" ? "SENT" : "GENERATED",
      pdfUrl,
      issuedAt,
      qrPayload: createCertificateQrPayload(existing.certificateNumber),
    },
    include: certificateInclude,
  });
}

export async function emailCertificate(certificateId: string) {
  let certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: certificateInclude,
  });

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  if (certificate.status === "QUEUED" || !certificate.pdfUrl || !certificate.issuedAt) {
    certificate = await generateCertificate(certificateId);
  }

  const render = toCertificateRenderData({
    certificateNumber: certificate.certificateNumber,
    runnerName: certificate.registration.user.name,
    eventTitle: certificate.registration.event.title,
    distance: certificate.registration.distance,
    bibNumber: certificate.registration.bibNumber,
    finishTimeSeconds: certificate.registration.finishTimeSeconds,
    issuedAt: certificate.issuedAt,
  });

  const emailResult = await sendCertificateEmail({
    to: certificate.registration.user.email,
    data: render,
  });

  if (emailResult.sent) {
    certificate = await prisma.certificate.update({
      where: { id: certificateId },
      data: { status: "SENT", pdfUrl: render.verifyUrl, issuedAt: certificate.issuedAt ?? new Date() },
      include: certificateInclude,
    });

    await prisma.notification.create({
      data: {
        userId: certificate.registration.userId,
        channel: "email",
        title: "Certificate emailed",
        body: `Certificate ${certificate.certificateNumber} sent to ${certificate.registration.user.email}`,
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: certificate.registration.userId,
        channel: "email",
        title: "Certificate email failed",
        body: emailResult.error ?? "Could not send certificate email",
      },
    });
  }

  return { certificate, email: emailResult };
}

/** Create (if needed) → generate → optionally email after proof approval. */
export async function issueCertificateAfterApproval(registrationId: string) {
  const cert = await ensureCertificateForRegistration(registrationId);
  const generated = await generateCertificate(cert.id);

  if (!env.certificateAutoSend) {
    return { certificate: generated, email: { sent: false as const, error: "auto-send disabled" } };
  }

  return emailCertificate(cert.id);
}

export async function bulkGenerateQueuedCertificates(limit = 50) {
  const queued = await prisma.certificate.findMany({
    where: { status: "QUEUED" },
    take: Math.min(Math.max(limit, 1), 200),
    orderBy: { id: "asc" },
  });

  const results = [];
  for (const item of queued) {
    results.push(await generateCertificate(item.id));
  }
  return results;
}

export async function bulkEmailGeneratedCertificates(limit = 50) {
  const ready = await prisma.certificate.findMany({
    where: { status: { in: ["GENERATED", "QUEUED"] } },
    take: Math.min(Math.max(limit, 1), 200),
    orderBy: { id: "asc" },
  });

  const results = [];
  for (const item of ready) {
    results.push(await emailCertificate(item.id));
  }
  return results;
}
