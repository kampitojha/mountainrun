import type { NextConfig } from "next";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

if (publishableKey && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
  },

  // ── Image optimisation ───────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 200, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
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
