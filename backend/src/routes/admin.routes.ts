import { Router } from "express";
import {
  adminBulkResendAllCertificates,
  adminCertificateEmailPreview,
  adminCreateCoupon,
  adminCreateEvent,
  adminDeleteCoupon,
  adminDeleteEvent,
  adminDeleteRegistration,
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
  adminExportMedalsCsv,
  adminListPayments,
  adminListProofs,
  adminListRegistrations,
  adminListSubscribers,
  adminListUsers,
  adminMarkRegistrationPaid,
  adminMe,
  adminOverview,
  adminReviewProof,
  adminSendCertificate,
  adminSendNewsletter,
  adminUpdateCertificate,
  adminUpdateCoupon,
  adminUpdateEvent,
  adminUpdateMedal,
  adminSyncPayments,
  adminTestAlert,
  adminOmniSearch,
  adminResendRegistrationEmail,
  adminUpdatePayment,
  adminUpdateRegistration,
  adminUpdateUserRole,
  adminBulkUploadTracking,
  adminCreateManualRegistration,
  adminDispatchMedalEmail,
  adminSubmitManualProof,
  adminGetLeaderboardManager,
  adminUpdateLeaderboardEntry,
  adminCreateLeaderboardEntry,
  adminDeleteLeaderboardEntry,
  adminGetTshirtManager,
  adminUpdateTshirtSize,
  adminSendTshirtReminderEmail,
} from "../controllers/admin.controller.js";
import { requireAdmin, requireClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const adminRouter = Router();

adminRouter.use(requireClerkAuth, requireAdmin);

adminRouter.get("/me", asyncHandler(adminMe));
adminRouter.get("/overview", asyncHandler(adminOverview));
adminRouter.get("/omni-search", asyncHandler(adminOmniSearch));
adminRouter.get("/audit", asyncHandler(adminListAudit));
adminRouter.post("/test-alert", asyncHandler(adminTestAlert));

adminRouter.get("/events", asyncHandler(adminListEvents));
adminRouter.get("/events/:id", asyncHandler(adminGetEvent));
adminRouter.post("/events", asyncHandler(adminCreateEvent));
adminRouter.put("/events/:id", asyncHandler(adminUpdateEvent));
adminRouter.delete("/events/:id", asyncHandler(adminDeleteEvent));

adminRouter.get("/registrations", asyncHandler(adminListRegistrations));
adminRouter.get("/registrations/export.csv", asyncHandler(adminExportRegistrationsCsv));
adminRouter.get("/registrations/:id", asyncHandler(adminGetRegistration));
adminRouter.patch("/registrations/:id", asyncHandler(adminUpdateRegistration));
adminRouter.delete("/registrations/:id", asyncHandler(adminDeleteRegistration));
adminRouter.post("/registrations/:id/mark-paid", asyncHandler(adminMarkRegistrationPaid));
adminRouter.post("/registrations/:id/resend-email", asyncHandler(adminResendRegistrationEmail));

adminRouter.get("/payments", asyncHandler(adminListPayments));
adminRouter.post("/payments/sync", asyncHandler(adminSyncPayments));
adminRouter.patch("/payments/:id", asyncHandler(adminUpdatePayment));

adminRouter.get("/users", asyncHandler(adminListUsers));
adminRouter.get("/users/:id", asyncHandler(adminGetUser));
adminRouter.patch("/users/:id/role", asyncHandler(adminUpdateUserRole));

adminRouter.get("/proofs", asyncHandler(adminListProofs));
adminRouter.post("/proofs/:id/review", asyncHandler(adminReviewProof));

adminRouter.get("/medals/export.csv", asyncHandler(adminExportMedalsCsv));
adminRouter.post("/medals/bulk-tracking", asyncHandler(adminBulkUploadTracking));
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
adminRouter.post("/certificates/bulk-resend-all", asyncHandler(adminBulkResendAllCertificates));
adminRouter.get("/certificates/:id/email-preview", asyncHandler(adminCertificateEmailPreview));
adminRouter.post(
  "/registrations/:id/certificate",
  asyncHandler(adminEnsureCertificateForRegistration),
);

adminRouter.get("/coupons", asyncHandler(adminListCoupons));
adminRouter.post("/coupons", asyncHandler(adminCreateCoupon));
adminRouter.patch("/coupons/:id", asyncHandler(adminUpdateCoupon));
adminRouter.delete("/coupons/:id", asyncHandler(adminDeleteCoupon));

adminRouter.get("/subscribers", asyncHandler(adminListSubscribers));
adminRouter.post("/newsletter/send", asyncHandler(adminSendNewsletter));

// ── Organizer Command Center Hub Routes ───────────────────────
adminRouter.post("/manual-registration", asyncHandler(adminCreateManualRegistration));
adminRouter.post("/medals/dispatch-email", asyncHandler(adminDispatchMedalEmail));
adminRouter.post("/manual-proof", asyncHandler(adminSubmitManualProof));
adminRouter.get("/leaderboard-manager", asyncHandler(adminGetLeaderboardManager));
adminRouter.post("/leaderboard-manager/entry", asyncHandler(adminCreateLeaderboardEntry));
adminRouter.patch("/leaderboard-manager/:id", asyncHandler(adminUpdateLeaderboardEntry));
adminRouter.delete("/leaderboard-manager/:id", asyncHandler(adminDeleteLeaderboardEntry));
adminRouter.get("/tshirts", asyncHandler(adminGetTshirtManager));
adminRouter.patch("/tshirts/:id", asyncHandler(adminUpdateTshirtSize));
adminRouter.post("/tshirts/send-reminder", asyncHandler(adminSendTshirtReminderEmail));
