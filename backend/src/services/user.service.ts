import { createClerkClient } from "@clerk/backend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

const clerkClient = env.clerkEnabled
  ? createClerkClient({ secretKey: env.clerkSecretKey })
  : null;

export type SyncUserInput = {
  clerkId: string;
  email?: string;
  name?: string;
  username?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

/**
 * Upsert a local DB user from a Clerk identity.
 * Prefer clerkId; fall back to email match for legacy rows.
 */
export async function upsertUserFromClerk(input: SyncUserInput) {
  const clerkId = input.clerkId.trim();
  if (!clerkId) {
    throw new ApiError(400, "clerkId is required");
  }

  let email = input.email?.trim().toLowerCase();
  let name = input.name?.trim();
  let username = input.username?.trim() || null;
  let phone = input.phone?.trim() || null;
  let avatarUrl = input.avatarUrl?.trim() || null;

  // Prefer live Clerk profile when server has the secret.
  if (clerkClient) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const primaryEmail =
        clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
      const primaryPhone =
        clerkUser.phoneNumbers.find((item) => item.id === clerkUser.primaryPhoneNumberId)
          ?.phoneNumber ?? clerkUser.phoneNumbers[0]?.phoneNumber;

      email = primaryEmail?.toLowerCase() ?? email;
      name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
        clerkUser.username ||
        name;
      username = clerkUser.username ?? username;
      phone = primaryPhone ?? phone;
      avatarUrl = clerkUser.imageUrl ?? avatarUrl;
    } catch {
      // Fall back to client-provided fields if Clerk fetch fails.
    }
  }

  if (!email) {
    throw new ApiError(400, "Email is required to create a user in the database");
  }

  if (!name) {
    name = email.split("@")[0] || "Runner";
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ clerkId }, { email }],
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        clerkId: existing.clerkId ?? clerkId,
        email,
        name,
        username: username ?? existing.username,
        phone: phone ?? existing.phone,
        avatarUrl: avatarUrl ?? existing.avatarUrl,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      username,
      phone,
      avatarUrl,
    },
  });
}
