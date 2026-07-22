import { Router } from "express";
import {
  adminCreateMedia,
  adminCreateTestimonial,
  adminDeleteMedia,
  adminDeleteTestimonial,
  adminListMedia,
  adminListTestimonials,
  adminReviewMediaSubmission,
  adminUpdateMedia,
  adminUpdateTestimonial,
  getGalleryContent,
  getHomeContent,
  submitGalleryPhoto,
} from "../controllers/content.controller.js";
import { requireAdmin, requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const contentRouter = Router();

contentRouter.get("/home", asyncHandler(getHomeContent));
contentRouter.get("/gallery", asyncHandler(getGalleryContent));
contentRouter.post("/gallery/submit", asyncHandler(submitGalleryPhoto));

export const adminContentRouter = Router();

adminContentRouter.use(requireClerkAuth, requireAdmin);

adminContentRouter.get("/media", asyncHandler(adminListMedia));
adminContentRouter.post("/media", asyncHandler(adminCreateMedia));
adminContentRouter.patch("/media/:id", asyncHandler(adminUpdateMedia));
adminContentRouter.delete("/media/:id", asyncHandler(adminDeleteMedia));
adminContentRouter.post("/media/:id/review", asyncHandler(adminReviewMediaSubmission));

adminContentRouter.get("/testimonials", asyncHandler(adminListTestimonials));
adminContentRouter.post("/testimonials", asyncHandler(adminCreateTestimonial));
adminContentRouter.patch("/testimonials/:id", asyncHandler(adminUpdateTestimonial));
adminContentRouter.delete("/testimonials/:id", asyncHandler(adminDeleteTestimonial));
