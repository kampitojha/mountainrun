import { Router } from "express";
import { applyReferralCode, checkReferralCode, getMyReferralCode } from "../controllers/referral.controller.js";
import { requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const referralRouter = Router();

referralRouter.get("/code", requireClerkAuth, asyncHandler(getMyReferralCode));
referralRouter.get("/check/:code", asyncHandler(checkReferralCode));
referralRouter.post("/apply", requireClerkAuth, asyncHandler(applyReferralCode));
