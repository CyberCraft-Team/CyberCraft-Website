import { NextRequest } from "next/server";

import { loginThrough } from "@/lib/server/login";

export async function POST(request: NextRequest) {
  return loginThrough(
    "/auth/google-login/",
    await request.json(),
    "user",
    request.nextUrl.searchParams,
  );
}
