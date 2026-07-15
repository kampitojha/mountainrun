import type { NextConfig } from "next";

/**
 * Vercel pe log kabhi `CLERK_PUBLISHABLE_KEY` set kar dete hain
 * (NEXT_PUBLIC_ prefix bhool jaate hain). Clerk Next.js ko
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY chahiye — yahan map kar dete hain.
 */
const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

if (publishableKey && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
}

const nextConfig: NextConfig = {
  // Ensure public key is available to client + middleware after build
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
  },
};

export default nextConfig;
