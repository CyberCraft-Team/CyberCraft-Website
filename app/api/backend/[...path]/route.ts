import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/server/backend";
import { KEYWORD_FOR, getToken, type Scope } from "@/lib/server/session";

/**
 * Authenticated pass-through to the Django backend.
 *
 * The browser calls `/api/backend/<path>` on its own origin; this handler
 * attaches the token from the HttpOnly cookie and forwards the request.
 * Browser JavaScript therefore never holds a credential.
 *
 * Scope is chosen by path: everything under `admin/` uses the admin cookie,
 * everything else the user cookie. A request whose scope has no cookie is
 * still forwarded unauthenticated, so the backend decides — public
 * endpoints keep working for logged-out visitors.
 */

// Uploads (skins, capes, mods, server archives) stream through here, so the
// body must not be buffered into memory by the framework.
export const dynamic = "force-dynamic";

const ADMIN_PREFIXES = ["admin/", "minecraft/"];

function scopeForPath(path: string): Scope {
  return ADMIN_PREFIXES.some((p) => path.startsWith(p)) ? "admin" : "user";
}

// Hop-by-hop and identity headers that must not be copied through.
const STRIPPED = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "authorization",
  "cookie",
  "content-length",
]);

async function proxy(request: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/");
  const scope = scopeForPath(path);
  const token = await getToken(scope);

  const search = request.nextUrl.search;
  const target = `${BACKEND_URL}/${path}${path.endsWith("/") || search ? "" : "/"}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED.has(key.toLowerCase())) headers.set(key, value);
  });
  if (token) headers.set("Authorization", `${KEYWORD_FOR[scope]} ${token}`);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // Required by undici whenever a stream is used as the body.
    ...(hasBody ? { duplex: "half" } : {}),
    redirect: "manual",
    cache: "no-store",
  } as RequestInit);

  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("content-length");
  outHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  return proxy(request, await ctx.params);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return proxy(request, await ctx.params);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return proxy(request, await ctx.params);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  return proxy(request, await ctx.params);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return proxy(request, await ctx.params);
}
