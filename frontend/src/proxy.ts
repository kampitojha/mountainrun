import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Auth UI routes must stay public (including OAuth SSO callbacks).
const isPublicRoute = createRouteMatcher([
  "/",
  "/events(.*)",
  "/gallery(.*)",
  "/about(.*)",
  "/leaderboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/register(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return;
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // Clerk handshake / proxy endpoints
    "/__clerk/:path*",
  ],
};
