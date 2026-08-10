import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { clearToken, getToken } from "@/lib/server/session";

export async function GET() {
  const token = await getToken("user");
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const result = await backendFetch("/auth/launcher/me/", {}, {
    token,
    keyword: "Launcher",
  });

  if (!result.ok) {
    // Expired or revoked: drop the cookie so the client stops retrying.
    await clearToken("user");
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json(result.data);
}
