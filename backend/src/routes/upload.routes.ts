import { Router } from "express";
import { uploadConfig, uploadProofImage } from "../controllers/upload.controller.js";
import { requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const uploadRouter = Router();

uploadRouter.get("/config", requireClerkAuth, asyncHandler(uploadConfig));
uploadRouter.post("/image", requireClerkAuth, asyncHandler(uploadProofImage));
