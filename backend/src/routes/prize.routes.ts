import { Router } from "express";
import {
  getWinnerClaimDetails,
  lookupPrizeByBib,
  myPrizes,
  submitWinnerClaim,
} from "../controllers/prize.controller.js";
import { requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const prizeRouter = Router();

prizeRouter.get("/my", requireClerkAuth, asyncHandler(myPrizes));
prizeRouter.get("/claim/:bibNumber", asyncHandler(getWinnerClaimDetails));
prizeRouter.post("/claim/:bibNumber", asyncHandler(submitWinnerClaim));
prizeRouter.get("/:bibNumber", asyncHandler(lookupPrizeByBib));
