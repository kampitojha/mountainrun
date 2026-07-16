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
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return;
  }

  if (isProtectedRoute(request)) {
    // Keep return URL so /admin → sign-in → back to /admin (not /register)
    await auth.protect({
      unauthenticatedUrl: new URL(
        `/sign-in?redirect_url=${encodeURIComponent(request.nextUrl.pathname)}`,
        request.url,
      ).toString(),
    });
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
