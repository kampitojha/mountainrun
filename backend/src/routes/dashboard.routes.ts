import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { requireAdmin, requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireClerkAuth, requireAdmin, asyncHandler(getDashboard));
