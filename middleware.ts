import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/cabinet"];
const ADMIN_PATHS = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get("cybercraft_user_token")?.value;
  const adminToken = request.cookies.get("cybercraft_admin_token")?.value;

  // Cabinet pages — require user auth
  const isCabinetRoute = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  if (isCabinetRoute && !userToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has token but accessing cabinet, verify it's still valid
  if (isCabinetRoute && userToken) {
    const isValid = await verifyUserToken(userToken);
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("cybercraft_user_token");
      return response;
    }
  }

  // Dashboard pages — require admin auth (only adminToken allowed, and must be valid)
  const isAdminRoute = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (isAdminRoute) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    const isValid = await verifyAdminToken(adminToken);
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/admin-login", request.url));
      response.cookies.delete("cybercraft_admin_token");
      return response;
    }
  }

  // If logged in AND token is valid, redirect away from auth pages
  if (AUTH_PAGES.some((path) => pathname === path) && userToken) {
    const isValid = await verifyUserToken(userToken);
    if (isValid) {
      return NextResponse.redirect(new URL("/cabinet/profile", request.url));
    }
    // Token is stale — clear cookie and let them see login page
    const response = NextResponse.next();
    response.cookies.delete("cybercraft_user_token");
    return response;
  }

  return NextResponse.next();
}

async function verifyUserToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/launcher/me/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin/me/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/cabinet/:path*", "/dashboard/:path*", "/login", "/register"],
};
