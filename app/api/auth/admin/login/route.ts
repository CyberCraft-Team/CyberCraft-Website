import { NextRequest } from "next/server";

import { loginThrough } from "@/lib/server/login";

export async function POST(request: NextRequest) {
  return loginThrough("/auth/admin/login/", await request.json(), "admin");
}
