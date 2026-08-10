import { NextResponse } from "next/server";

import { backendFetch, backendOrigin } from "@/lib/server/backend";
import { getToken } from "@/lib/server/session";

/**
 * Mint a short-lived WebSocket ticket.
 *
 * A WebSocket cannot carry an Authorization header from the browser, and the
 * session token is HttpOnly, so the client cannot put it in the query string
 * either. This exchanges the cookie for the backend's 10-minute
 * websocket-scoped token, which is safe to hand to page JavaScript: it
 * expires quickly and authorises nothing but a socket.
 */
export async function GET() {
  const token = (await getToken("admin")) ?? (await getToken("user"));
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const keyword = (await getToken("admin")) ? "Token" : "Launcher";
  const result = await backendFetch<{ token?: string; expires_in?: number }>(
    "/launcher/ws-token/",
    {},
    { token, keyword },
  );

  if (!result.ok || !result.data?.token) {
    return NextResponse.json({ error: "Could not mint ticket" }, { status: 502 });
  }

  return NextResponse.json({
    token: result.data.token,
    expires_in: result.data.expires_in ?? 600,
    origin: backendOrigin(),
  });
}
