import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { clearToken, getToken } from "@/lib/server/session";

export async function GET() {
  const token = await getToken("admin");
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const result = await backendFetch("/auth/admin/me/", {}, {
    token,
    keyword: "Token",
  });

  if (!result.ok) {
    await clearToken("admin");
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json(result.data);
}
