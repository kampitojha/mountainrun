import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { upsertUserFromClerk } from "../services/user.service.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";
import { syncUserSchema } from "../validators/common.validator.js";
import { prisma } from "../lib/prisma.js";

/**
 * Sync the signed-in Clerk user into Postgres.
 * Called automatically by the frontend after login / page load.
 */
export async function syncCurrentUser(request: AuthenticatedRequest, response: Response) {
  const body = validateBody(syncUserSchema, request);

  const clerkId = request.auth?.userId ?? body.clerkId;
  if (!clerkId) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await upsertUserFromClerk({
    clerkId,
    email: body.email,
    name: body.name,
    username: body.username,
    phone: body.phone,
    avatarUrl: body.avatarUrl,
  });

  response.json({
    data: user,
    meta: { synced: true },
  });
}

/** Return the local DB user for the current Clerk session (auto-sync if missing). */
export async function getCurrentUser(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth?.userId;
  if (!clerkId) {
    throw new ApiError(401, "Authentication required");
  }

  const registrationInclude = {
    orderBy: { registeredAt: "desc" as const },
    take: 20,
    include: {
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  };

  let user = await prisma.user.findFirst({
    where: { clerkId },
    include: {
      registrations: registrationInclude,
    },
  });

  if (!user) {
    await upsertUserFromClerk({ clerkId });
    user = await prisma.user.findFirst({
      where: { clerkId },
      include: {
        registrations: registrationInclude,
      },
    });
  }

  if (!user) {
    throw new ApiError(404, "User not found in database");
  }

  response.json({ data: user });
}
