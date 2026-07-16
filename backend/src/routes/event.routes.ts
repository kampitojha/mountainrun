import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import { requireAdmin, requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const eventRouter = Router();

eventRouter.get("/", asyncHandler(listEvents));
eventRouter.get("/:slug", asyncHandler(getEvent));
eventRouter.post("/", requireClerkAuth, requireAdmin, asyncHandler(createEvent));
eventRouter.put("/:id", requireClerkAuth, requireAdmin, asyncHandler(updateEvent));
eventRouter.delete("/:id", requireClerkAuth, requireAdmin, asyncHandler(deleteEvent));
