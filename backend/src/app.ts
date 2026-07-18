import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/admin.routes.js";
import { certificateRouter } from "./routes/certificate.routes.js";
import { adminContentRouter, contentRouter } from "./routes/content.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { ApiError } from "./utils/api-error.js";

export const app = express();
const allowedOrigins = new Set(env.allowedOrigins);

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) {
    return true;
  }

  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.has(normalized)) {
    return true;
  }

  if (env.nodeEnv !== "production") {
    try {
      const url = new URL(normalized);
      return url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    } catch {
      return false;
    }
  }

  return false;
}

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
}));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
// 2mb: proof screenshots as data URLs before Cloudinary (prefer Cloudinary in prod)
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "mountainrun-api" });
});

app.get("/", (_request, response) => {
  response.json({
    service: "mountainrun-api",
    status: "ok",
    health: "/health",
    docs: "API routes are under /api/*",
  });
});

app.use("/api/admin", adminRouter);
app.use("/api/admin/content", adminContentRouter);
app.use("/api/content", contentRouter);
app.use("/api/events", eventRouter);
app.use("/api/users", userRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/certificates", certificateRouter);
app.use("/api/uploads", uploadRouter);

app.use((_request, _response, next) => {
  next(new ApiError(404, "Route not found"));
});

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  void _next;
  const statusCode = error instanceof ApiError ? error.statusCode : 500;

  response.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : error.message,
    },
  });
});
