import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

/**
 * Registration is multipart -- the skin PNG is mandatory -- so the body is
 * streamed through rather than parsed. It issues no token: the backend
 * returns the created user and the visitor logs in afterwards.
 */
export async function POST(request: NextRequest) {
  const response = await fetch(`${BACKEND_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "",
      Accept: "application/json",
    },
    body: request.body,
    duplex: "half",
    cache: "no-store",
  } as RequestInit);

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
