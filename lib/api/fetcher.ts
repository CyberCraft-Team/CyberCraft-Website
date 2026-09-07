"use client";

/**
 * Client-side access to the backend, through this app's own origin.
 *
 * Everything goes to /api/backend/..., where a route handler attaches the
 * token from the HttpOnly session cookie. No credential is ever held by
 * browser JavaScript, so there is nothing for an XSS to steal, and there is
 * no Authorization header to build here.
 *
 * Paths are written without a leading slash and without the /api/v1 prefix:
 *   apiFetch("public/stats/")
 *   apiFetch("admin/users/12/ban/", { method: "POST", json: { reason } })
 */

const PROXY = "/api/backend";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiInit = Omit<RequestInit, "body"> & {
  json?: unknown;
  body?: BodyInit | null;
};

function messageFrom(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["error", "detail", "message"]) {
      const value = record[key];
      if (typeof value === "string") return value;
    }
    if (record.errors) return JSON.stringify(record.errors);
  }
  if (typeof payload === "string" && payload) return payload;
  return `So'rov bajarilmadi (${status})`;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiInit = {},
): Promise<T> {
  const { json, headers, ...rest } = init;

  const finalHeaders = new Headers(headers);
  let body = init.body;

  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  } else if (typeof body === "string" && !finalHeaders.has("Content-Type")) {
    // fetch() labels a string body "text/plain", which DRF has no parser
    // for -- every caller that pre-stringified its payload instead of using
    // `json` got a 415 back, the console command among them. A string body
    // here is always JSON.
    finalHeaders.set("Content-Type", "application/json");
  }

  // Next redirects a trailing slash away with a 308, so paths are sent
  // without one and the proxy re-adds it for Django. Keeping it here cost an
  // extra round-trip on every single request.
  const [rawPath, query] = path.replace(/^\/+/, "").split("?");
  const proxyPath = rawPath.replace(/\/+$/, "") + (query ? `?${query}` : "");

  const response = await fetch(`${PROXY}/${proxyPath}`, {
    ...rest,
    headers: finalHeaders,
    body,
    credentials: "same-origin",
  });

  const type = response.headers.get("content-type") ?? "";
  const payload = type.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    throw new ApiError(messageFrom(payload, response.status), response.status, payload);
  }

  return payload as T;
}

/** SWR fetcher. */
export const swrFetcher = <T = unknown>(path: string): Promise<T> =>
  apiFetch<T>(path);

/**
 * Exchange the session cookie for a short-lived WebSocket ticket.
 * Returns the ticket and the backend origin to open the socket against.
 */
export async function getWebSocketTicket(): Promise<{
  token: string;
  origin: string;
  expires_in: number;
}> {
  const response = await fetch("/api/ws-ticket", { credentials: "same-origin" });
  if (!response.ok) throw new ApiError("WebSocket ticket olinmadi", response.status, null);
  return response.json();
}
