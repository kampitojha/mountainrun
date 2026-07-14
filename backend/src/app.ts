import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { certificateRouter } from "./routes/certificate.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";
import { ApiError } from "./utils/api-error.js";

export const app = express();
const allowedOrigins = new Set([
  env.frontendUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  if (env.nodeEnv !== "production") {
    try {
      const url = new URL(origin);
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

    callback(new ApiError(403, "Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "mountainrun-api" });
});

app.use("/api/events", eventRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/certificates", certificateRouter);

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
