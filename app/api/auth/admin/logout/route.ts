import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { clearToken, getToken } from "@/lib/server/session";

export async function POST() {
  const token = await getToken("admin");
  if (token) {
    await backendFetch("/auth/admin/logout/", { method: "POST" }, {
      token,
      keyword: "Token",
    }).catch(() => undefined);
  }
  await clearToken("admin");
  return NextResponse.json({ ok: true });
}
