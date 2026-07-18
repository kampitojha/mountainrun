import "dotenv/config";

function readEnv(name: string, fallback = "") {
  return (process.env[name] ?? fallback).trim();
}

/** True when a real Clerk secret is set (not empty / placeholder). */
export function isClerkConfigured(secretKey = readEnv("CLERK_SECRET_KEY")) {
  if (!secretKey) {
    return false;
  }

  const lower = secretKey.toLowerCase();
  if (
    lower.includes("your_") ||
    lower.includes("placeholder") ||
    lower.endsWith("...") ||
    lower === "sk_test_..." ||
    lower === "sk_live_..."
  ) {
    return false;
  }

  return secretKey.startsWith("sk_");
}

function parseEmailList(raw: string) {
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function parseOriginList(raw: string) {
  return raw
    .split(",")
    .map((part) => part.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const configuredFrontendOrigins = parseOriginList(
  readEnv("FRONTEND_URL", "http://localhost:3000"),
);

/** Browser origins allowed for CORS + Clerk token verification. */
const allowedOrigins = Array.from(
  new Set([
    ...configuredFrontendOrigins,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:49154",
    "https://mountainrun.in",
    "https://www.mountainrun.in",
  ]),
);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: configuredFrontendOrigins[0] ?? "http://localhost:3000",
  allowedOrigins,
  nodeEnv: process.env.NODE_ENV ?? "development",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL ?? "Mountain Run <onboarding@resend.dev>",
  cloudinaryCloudName: readEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: readEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: readEnv("CLOUDINARY_API_SECRET"),
  /** When true, proof approve auto-generates + emails certificate. */
  certificateAutoSend:
    readEnv("CERTIFICATE_AUTO_SEND", "true").toLowerCase() !== "false",
  clerkSecretKey: readEnv("CLERK_SECRET_KEY"),
  clerkPublishableKey: readEnv("CLERK_PUBLISHABLE_KEY"),
  /** Comma-separated emails that always get admin (e.g. you@gmail.com) */
  adminEmails: parseEmailList(readEnv("ADMIN_EMAILS")),
  /**
   * When true (default in development), the first signed-in user who hits
   * an admin route becomes SUPER_ADMIN if no admin exists yet.
   */
  adminBootstrap:
    readEnv("ADMIN_BOOTSTRAP", process.env.NODE_ENV === "production" ? "false" : "true")
      .toLowerCase() === "true",
  get clerkEnabled() {
    return isClerkConfigured(this.clerkSecretKey);
  },
};
