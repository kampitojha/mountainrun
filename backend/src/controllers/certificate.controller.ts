import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import {
  ensureCertificateForRegistration,
  generateCertificate,
} from "../services/certificate-issue.service.js";

const certificateInclude = {
  registration: {
    include: {
      user: true,
      event: true,
    },
  },
} as const;

export async function verifyCertificate(request: Request, response: Response) {
  const rawParam = routeParam(request, "certificateNumber");
  if (!rawParam) {
    throw new ApiError(400, "Certificate number or Bib number is required");
  }

  const mode: Prisma.QueryMode = "insensitive";

  // 1. Clean and normalize input variations
  const decoded = decodeURIComponent(rawParam).trim();
  const upper = decoded.toUpperCase();
  const normalizedHyphens = upper.replace(/\s+/g, "-").replace(/-+/g, "-");
  const cleanAlphanumeric = upper.replace(/[^A-Z0-9]/g, "");

  // Candidate bib numbers if input starts with MR-YEAR or MRYEAR
  // e.g. "MR-2026-TAR124824" -> "TAR124824", "MR2026TAR124824" -> "TAR124824"
  const strippedBibCandidate = cleanAlphanumeric.replace(/^MR\d{4}/, "");

  // 2. Multi-tier lookup
  // A. Search in Certificate table
  let certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: { equals: decoded, mode } },
        { certificateNumber: { equals: upper, mode } },
        { certificateNumber: { equals: normalizedHyphens, mode } },
        { registration: { bibNumber: { equals: decoded, mode } } },
        { registration: { bibNumber: { equals: upper, mode } } },
        { registration: { bibNumber: { equals: normalizedHyphens, mode } } },
        ...(strippedBibCandidate
          ? [{ registration: { bibNumber: { equals: strippedBibCandidate, mode } } }]
          : []),
      ],
    },
    include: certificateInclude,
  });

  // B. Fallback: Search all certificates in memory by clean alphanumeric if database indexing/hyphenation differed
  if (!certificate && cleanAlphanumeric.length >= 3) {
    const allRecentCerts = await prisma.certificate.findMany({
      take: 1000,
      orderBy: { id: "desc" },
      include: certificateInclude,
    });
    certificate =
      allRecentCerts.find((c) => {
        const cAlpha = c.certificateNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        const bibAlpha = c.registration.bibNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        return (
          cAlpha === cleanAlphanumeric ||
          bibAlpha === cleanAlphanumeric ||
          (strippedBibCandidate && bibAlpha === strippedBibCandidate)
        );
      }) ?? null;
  }

  // C. If still no Certificate record, check if a matching Registration exists
  if (!certificate) {
    const registration = await prisma.registration.findFirst({
      where: {
        OR: [
          { bibNumber: { equals: decoded, mode } },
          { bibNumber: { equals: upper, mode } },
          { bibNumber: { equals: normalizedHyphens, mode } },
          ...(strippedBibCandidate
            ? [{ bibNumber: { equals: strippedBibCandidate, mode } }]
            : []),
        ],
      },
      include: {
        user: true,
        event: true,
        certificate: true,
      },
    });

    if (registration) {
      // Auto-create certificate for this confirmed/completed/approved registration
      const certRecord = await ensureCertificateForRegistration(registration.id);
      await generateCertificate(certRecord.id);
      certificate = await prisma.certificate.findUnique({
        where: { id: certRecord.id },
        include: certificateInclude,
      });
    }
  }

  if (!certificate) {
    throw new ApiError(404, "Certificate not found. Please verify your Certificate ID or Bib Number.");
  }

  // If certificate is QUEUED or missing issuedAt, generate it on the fly so the runner gets their certificate instantly!
  if (certificate.status === "QUEUED" || !certificate.issuedAt) {
    await generateCertificate(certificate.id);
    certificate = await prisma.certificate.findUniqueOrThrow({
      where: { id: certificate.id },
      include: certificateInclude,
    });
  }

  response.json({
    data: {
      certificateNumber: certificate.certificateNumber,
      status: certificate.status,
      runnerName: certificate.registration.user.name,
      event: certificate.registration.event.title,
      distance: certificate.registration.distance,
      bibNumber: certificate.registration.bibNumber,
      finishTimeSeconds: certificate.registration.finishTimeSeconds,
      issuedAt: certificate.issuedAt,
      pdfUrl: certificate.pdfUrl,
      verified: true,
    },
  });
}
