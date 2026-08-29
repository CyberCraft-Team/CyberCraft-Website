import "server-only";

import { NextResponse } from "next/server";

import { buildLauncherCallback } from "@/lib/launcher-callback";
import { backendFetch } from "./backend";
import { setToken, type Scope } from "./session";

type LoginPayload = {
  token?: string;
  user?: { username?: string; [key: string]: unknown };
  needs_username?: boolean;
  [key: string]: unknown;
};

/**
 * Run a backend login endpoint and turn its token into a session cookie.
 *
 * The token is deliberately dropped from the response: the browser gets the
 * user object only. Everything that needs the credential goes through
 * /api/backend, which reads the cookie server-side.
 *
 * The one exception is the launcher's OAuth handoff: it lands on /login
 * with a `callback` query param and needs the raw token to hand to its own
 * loopback server. Rather than exposing the token to page JS to build that
 * URL (the previous approach — and briefly a bug, since the token used to
 * be dropped from here without the launcher URL being built as a
 * replacement, so the launcher received a literal "undefined" token), the
 * callback URL is built here, server-side, from the token before it's
 * stripped, and handed back as `callbackUrl` instead.
 *
 * The Google and Telegram flows can answer `needs_username` instead of a
 * token, which is passed straight through so the UI can prompt.
 */
export async function loginThrough(
  path: string,
  body: unknown,
  scope: Scope,
  launcherSearchParams?: URLSearchParams,
): Promise<NextResponse> {
  const result = await backendFetch<LoginPayload>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return NextResponse.json(result.data ?? { error: "Login failed" }, {
      status: result.status,
    });
  }

  const payload = result.data ?? {};

  if (payload.needs_username) {
    return NextResponse.json(payload, { status: 200 });
  }

  if (!payload.token) {
    return NextResponse.json(
      { error: "Backend javobida token yo'q" },
      { status: 502 },
    );
  }

  await setToken(scope, payload.token);

  const callbackUrl = launcherSearchParams
    ? buildLauncherCallback(launcherSearchParams, payload.token, payload.user?.username ?? "")
    : null;

  const { token: _dropped, ...safe } = payload;
  return NextResponse.json(
    callbackUrl ? { ...safe, callbackUrl } : safe,
    { status: 200 },
  );
}
