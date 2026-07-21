import { z } from "zod";

export const syncUserSchema = z.object({
  clerkId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(200).optional(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
});

export const checkReferralCodeSchema = z.object({
  code: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/),
});

export const applyReferralCodeSchema = z.object({
  code: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/),
});

export const leaderboardQuerySchema = z.object({
  distance: z.string().min(1).max(50).optional(),
  page: z.coerce.number().int().positive().max(100).optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(100),
});
