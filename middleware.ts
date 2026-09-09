import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

/**
 * Deliberately narrow. Clerk exists here for one job — proving an email on the
 * player's phone — so it runs on the join page and the route that mints tokens,
 * and nowhere near the kiosk screen or the booth console.
 */
export const config = {
  matcher: ["/join/:path*", "/api/token"],
};
