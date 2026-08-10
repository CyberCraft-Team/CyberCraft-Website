import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { clearToken, getToken } from "@/lib/server/session";

export async function POST() {
  const token = await getToken("user");
  if (token) {
    // Revoke server-side too; a cleared cookie alone would leave the token
    // valid for anyone who captured it.
    await backendFetch("/auth/launcher/logout/", { method: "POST" }, {
      token,
      keyword: "Launcher",
    }).catch(() => undefined);
  }
  await clearToken("user");
  return NextResponse.json({ ok: true });
}
