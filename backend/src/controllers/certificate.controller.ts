import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";

export async function verifyCertificate(request: Request, response: Response) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber: routeParam(request, "certificateNumber") },
    include: {
      registration: {
        include: {
          user: true,
          event: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  // Only expose issued certificates publicly (GENERATED / SENT)
  if (certificate.status === "QUEUED") {
    throw new ApiError(404, "Certificate not found or not yet issued");
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
