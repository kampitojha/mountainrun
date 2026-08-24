import type { NextConfig } from "next";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

if (publishableKey && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
  },

  // ── Webhook proxy ─────────────────────────────────────────
  // Razorpay webhook URL points to mountainrun.in (Vercel).
  // This rewrite forwards it to the Railway backend so the
  // Express handler can process the raw body + signature.
  async rewrites() {
    const list = [
      {
        source: "/images/club-push.png",
        destination: "/images/club-push.svg",
      },
      {
        source: "/images/first-medal.png",
        destination: "/images/first-medal.svg",
      },
      {
        source: "/images/mountain-run-hero.png",
        destination: "/images/mountain-run-hero.svg",
      },
      {
        source: "/images/sunrise-finish.png",
        destination: "/images/sunrise-finish.svg",
      },
      {
        source: "/images/weekend-long-run.png",
        destination: "/images/weekend-long-run.svg",
      },
    ];
    if (apiUrl) {
      list.push({
        source: "/api/payments/webhook",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/payments/webhook`,
      });
    }
    return list;
  },

  // ── Image optimisation ───────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 200, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },

  // ── Compression ──────────────────────────────────────────
  compress: true,

  // ── Experimental perf ────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@clerk/nextjs",
    ],
  },
};

export default nextConfig;
