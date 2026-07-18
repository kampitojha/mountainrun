import { Router } from "express";
import {
  adminCreateCoupon,
  adminCreateEvent,
  adminDeleteCoupon,
  adminDeleteEvent,
  adminExportRegistrationsCsv,
  adminGetEvent,
  adminGetRegistration,
  adminGetUser,
  adminListAudit,
  adminBulkGenerateCertificates,
  adminBulkSendCertificates,
  adminEnsureCertificateForRegistration,
  adminGenerateAndSendCertificate,
  adminGenerateCertificate,
  adminListCertificates,
  adminListCoupons,
  adminListEvents,
  adminListMedals,
  adminListPayments,
  adminListProofs,
  adminListRegistrations,
  adminListUsers,
  adminMarkRegistrationPaid,
  adminMe,
  adminOverview,
  adminReviewProof,
  adminSendCertificate,
  adminUpdateCertificate,
  adminUpdateCoupon,
  adminUpdateEvent,
  adminUpdateMedal,
  adminUpdatePayment,
  adminUpdateRegistration,
  adminUpdateUserRole,
} from "../controllers/admin.controller.js";
import { requireAdmin, requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const adminRouter = Router();

adminRouter.use(requireClerkAuth, requireAdmin);

adminRouter.get("/me", asyncHandler(adminMe));
adminRouter.get("/overview", asyncHandler(adminOverview));
adminRouter.get("/audit", asyncHandler(adminListAudit));

adminRouter.get("/events", asyncHandler(adminListEvents));
adminRouter.get("/events/:id", asyncHandler(adminGetEvent));
adminRouter.post("/events", asyncHandler(adminCreateEvent));
adminRouter.put("/events/:id", asyncHandler(adminUpdateEvent));
adminRouter.delete("/events/:id", asyncHandler(adminDeleteEvent));

adminRouter.get("/registrations", asyncHandler(adminListRegistrations));
adminRouter.get("/registrations/export.csv", asyncHandler(adminExportRegistrationsCsv));
adminRouter.get("/registrations/:id", asyncHandler(adminGetRegistration));
adminRouter.patch("/registrations/:id", asyncHandler(adminUpdateRegistration));
adminRouter.post("/registrations/:id/mark-paid", asyncHandler(adminMarkRegistrationPaid));

adminRouter.get("/payments", asyncHandler(adminListPayments));
adminRouter.patch("/payments/:id", asyncHandler(adminUpdatePayment));

adminRouter.get("/users", asyncHandler(adminListUsers));
adminRouter.get("/users/:id", asyncHandler(adminGetUser));
adminRouter.patch("/users/:id/role", asyncHandler(adminUpdateUserRole));

adminRouter.get("/proofs", asyncHandler(adminListProofs));
adminRouter.post("/proofs/:id/review", asyncHandler(adminReviewProof));

adminRouter.get("/medals", asyncHandler(adminListMedals));
adminRouter.patch("/medals/:id", asyncHandler(adminUpdateMedal));

adminRouter.get("/certificates", asyncHandler(adminListCertificates));
adminRouter.patch("/certificates/:id", asyncHandler(adminUpdateCertificate));
adminRouter.post("/certificates/:id/generate", asyncHandler(adminGenerateCertificate));
adminRouter.post("/certificates/:id/send", asyncHandler(adminSendCertificate));
adminRouter.post(
  "/certificates/:id/generate-and-send",
  asyncHandler(adminGenerateAndSendCertificate),
);
adminRouter.post("/certificates/bulk-generate", asyncHandler(adminBulkGenerateCertificates));
adminRouter.post("/certificates/bulk-send", asyncHandler(adminBulkSendCertificates));
adminRouter.post(
  "/registrations/:id/certificate",
  asyncHandler(adminEnsureCertificateForRegistration),
);

adminRouter.get("/coupons", asyncHandler(adminListCoupons));
adminRouter.post("/coupons", asyncHandler(adminCreateCoupon));
adminRouter.patch("/coupons/:id", asyncHandler(adminUpdateCoupon));
adminRouter.delete("/coupons/:id", asyncHandler(adminDeleteCoupon));
