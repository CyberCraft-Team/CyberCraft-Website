import "server-only";

import { cookies } from "next/headers";

import { ADMIN_COOKIE, USER_COOKIE } from "../session-constants";

/**
 * Session cookies.
 *
 * The token used to live in localStorage *and* in a JavaScript-readable
 * cookie, so any XSS on the site handed an attacker a 30-day credential.
 * It now lives only here: HttpOnly, so the browser attaches it to
 * same-origin requests and no script can read it.
 */

export { USER_COOKIE, ADMIN_COOKIE };

export type Scope = "user" | "admin";

const COOKIE_FOR: Record<Scope, string> = {
  user: USER_COOKIE,
  admin: ADMIN_COOKIE,
};

// Mirrors the backend token lifetimes: launcher scope 30 days, admin 24 hours.
const MAX_AGE: Record<Scope, number> = {
  user: 60 * 60 * 24 * 30,
  admin: 60 * 60 * 24,
};

/** Header keyword each scope's token must be sent with. */
export const KEYWORD_FOR: Record<Scope, "Launcher" | "Token"> = {
  user: "Launcher",
  admin: "Token",
};

export async function getToken(scope: Scope): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_FOR[scope])?.value ?? null;
}

export async function setToken(scope: Scope, token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_FOR[scope], token, {
    httpOnly: true,
    // Lax rather than Strict: the launcher OAuth flow returns via a
    // top-level navigation from the browser, and Strict would drop the
    // cookie on that first request.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE[scope],
  });
}

export async function clearToken(scope: Scope): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_FOR[scope]);
}
