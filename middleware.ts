import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_COOKIE, USER_COOKIE } from "@/lib/session-constants";

const PROTECTED_PATHS = ["/cabinet"];
const ADMIN_PATHS = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * Route gate.
 *
 * This only checks whether a session cookie is present. It used to call the
 * backend on every protected navigation to validate the token, which made
 * each page load wait on an uncached round-trip and logged everyone out
 * whenever the backend was briefly unreachable.
 *
 * Validation now happens where it belongs: /api/backend forwards the token
 * and the backend answers 401, and the auth hooks clear the cookie when they
 * see one. The worst case here is that a visitor with a stale cookie reaches
 * the page shell and is bounced a moment later by the data layer.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasUser = Boolean(request.cookies.get(USER_COOKIE)?.value);
  const hasAdmin = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !hasUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !hasAdmin) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  if (AUTH_PAGES.includes(pathname) && hasUser) {
    // Preserve the launcher OAuth handoff: it lands on /login with a
    // callback, and redirecting away would strand the desktop app.
    if (!request.nextUrl.searchParams.has("callback")) {
      return NextResponse.redirect(new URL("/cabinet/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cabinet/:path*", "/dashboard/:path*", "/login", "/register"],
};
