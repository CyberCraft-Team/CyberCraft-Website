import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { ADMIN_COOKIE, USER_COOKIE } from "@/lib/session-constants";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATHS = ["/cabinet"];
const ADMIN_PATHS = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * Locale routing plus the route gate.
 *
 * The gate only checks whether a session cookie is present. It used to call
 * the backend on every protected navigation to validate the token, which
 * blocked each page load on an uncached round-trip and logged everyone out
 * whenever the backend was briefly unreachable. Validation belongs to the
 * data layer: /api/backend forwards the token, the backend answers 401, and
 * the auth hooks clear the cookie.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes carry no locale and must never be rewritten.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Strip a leading /ru or /en so the gate can match on bare paths. uz has
  // no prefix, because localePrefix is "as-needed".
  const localeMatch = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  const bare = localeMatch ? pathname.slice(localeMatch.length + 1) || "/" : pathname;
  const withLocale = (path: string) =>
    new URL(localeMatch ? `/${localeMatch}${path}` : path, request.url);

  const hasUser = Boolean(request.cookies.get(USER_COOKIE)?.value);
  const hasAdmin = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);

  if (PROTECTED_PATHS.some((p) => bare.startsWith(p)) && !hasUser) {
    const loginUrl = withLocale("/login");
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (ADMIN_PATHS.some((p) => bare.startsWith(p)) && !hasAdmin) {
    return NextResponse.redirect(withLocale("/admin-login"));
  }

  if (AUTH_PAGES.includes(bare) && hasUser) {
    // Preserve the launcher OAuth handoff: it lands on /login with a
    // callback, and redirecting away would strand the desktop app.
    if (!request.nextUrl.searchParams.has("callback")) {
      return NextResponse.redirect(withLocale("/cabinet/profile"));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
