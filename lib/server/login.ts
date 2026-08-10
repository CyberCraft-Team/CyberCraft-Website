import "server-only";

import { NextResponse } from "next/server";

import { backendFetch } from "./backend";
import { setToken, type Scope } from "./session";

type LoginPayload = {
  token?: string;
  user?: unknown;
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
 * The Google and Telegram flows can answer `needs_username` instead of a
 * token, which is passed straight through so the UI can prompt.
 */
export async function loginThrough(
  path: string,
  body: unknown,
  scope: Scope,
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

  const { token: _dropped, ...safe } = payload;
  return NextResponse.json(safe, { status: 200 });
}
