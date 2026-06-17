import createMiddleware from "next-intl/middleware";

import { auth } from "@/auth";
import { routing } from "@/i18n/routing";

const handleI18n = createMiddleware(routing);

// Wrapping with Auth.js runs the `authorized` callback (src/auth.ts) first:
// gated /admin/* routes redirect unauthenticated users to /admin/login exactly
// as before. For every other (public) request `authorized` returns true and we
// hand off to next-intl for locale negotiation. Admin stays non-localized.
export default auth((request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) return;
  return handleI18n(request);
});

export const config = {
  // Auth.js on /admin/*, next-intl on public pages; skip api, internals, files.
  matcher: ["/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
