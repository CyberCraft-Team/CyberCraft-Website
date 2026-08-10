import "server-only";

/**
 * Server-side access to the Django backend.
 *
 * Nothing in this module may be imported from a client component: it reads
 * the session cookie, which is HttpOnly precisely so that browser
 * JavaScript cannot reach the token. The "server-only" import makes that a
 * build error rather than a silent leak.
 */

export const BACKEND_URL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

export type BackendResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
};

function joinPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

async function readBody(response: Response): Promise<unknown> {
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return await response.text();
}

/**
 * Call the backend with an optional bearer token.
 *
 * `keyword` mirrors what the backend's authentication classes accept:
 * launcher-scope tokens go out as `Launcher`, admin-scope as `Token`.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  auth?: { token: string; keyword?: "Launcher" | "Token" },
): Promise<BackendResult<T>> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (auth?.token) {
    headers.set("Authorization", `${auth.keyword ?? "Launcher"} ${auth.token}`);
  }

  const response = await fetch(`${BACKEND_URL}${joinPath(path)}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return {
    ok: response.ok,
    status: response.status,
    data: (await readBody(response)) as T,
  };
}

/** Backend origin without the /api/v1 suffix, for WebSocket URLs. */
export function backendOrigin(): string {
  try {
    return new URL(BACKEND_URL).origin;
  } catch {
    return "http://localhost:8000";
  }
}
