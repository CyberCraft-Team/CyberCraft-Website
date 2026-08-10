import { NextRequest } from "next/server";

import { loginThrough } from "@/lib/server/login";

export async function POST(request: NextRequest) {
  return loginThrough("/auth/telegram-login/", await request.json(), "user");
}
