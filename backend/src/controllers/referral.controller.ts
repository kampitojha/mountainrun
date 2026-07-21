import type { Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { ApiError } from "../utils/api-error.js";

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getMyReferralCode(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth!.userId;

  const user = await prisma.user.findFirst({ where: { clerkId } });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.referralCode) {
    let code: string;
    let exists = true;
    do {
      code = generateCode();
      exists = !!(await prisma.user.findUnique({ where: { referralCode: code } }));
    } while (exists);

    await prisma.user.update({ where: { id: user.id }, data: { referralCode: code } });
    user.referralCode = code;
  }

  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    select: { refereeId: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const converted = referrals.filter((r) => r.status === "converted").length;

  response.json({
    data: {
      code: user.referralCode,
      link: `${env.frontendUrl}/register?ref=${user.referralCode}`,
      totalReferrals: referrals.length,
      converted,
      referrals,
    },
  });
}

export async function checkReferralCode(request: AuthenticatedRequest, response: Response) {
  const code = request.params.code;
  if (!code || typeof code !== "string" || code.length < 4) {
    throw new ApiError(400, "Invalid referral code");
  }

  const referrer = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } });
  if (!referrer) {
    throw new ApiError(404, "Referral code not found");
  }

  response.json({ data: { valid: true, referrer: referrer.name } });
}

export async function applyReferralCode(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth!.userId;
  const { code } = request.body as { code?: string };
  if (!code || typeof code !== "string") {
    throw new ApiError(400, "Referral code is required");
  }

  const referee = await prisma.user.findFirst({ where: { clerkId } });
  if (!referee) throw new ApiError(404, "User not found");

  const referrer = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } });
  if (!referrer) throw new ApiError(404, "Referral code not found");
  if (referrer.id === referee.id) throw new ApiError(400, "You cannot refer yourself");

  const existing = await prisma.referral.findUnique({ where: { refereeId: referee.id } });
  if (existing) throw new ApiError(400, "You have already been referred by someone");

  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId: referee.id,
      code: code.toUpperCase(),
      status: "pending",
    },
  });

  response.json({ data: { message: "Referral code applied successfully" } });
}
