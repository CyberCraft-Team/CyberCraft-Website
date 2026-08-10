/**
 * Builds the redirect back to the desktop launcher after a successful login.
 *
 * The launcher opens the browser at /login?callback=<loopback url>&state=<nonce>
 * and waits on a loopback HTTP server. On success the browser is sent back to
 * that URL carrying the session token.
 *
 * Two things this guards against:
 *
 * 1. The callback used to be accepted on a `startsWith("http://localhost:")`
 *    check. That is bypassable: `http://localhost:1234@evil.com/` satisfies the
 *    prefix and resolves to evil.com, handing the token to an attacker. The URL
 *    is parsed and the hostname compared instead.
 *
 * 2. The state nonce is echoed back so the launcher can tell its own flow from
 *    an unrelated request to its loopback port.
 */

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function buildLauncherCallback(
  search: URLSearchParams,
  token: string,
  username: string,
): string | null {
  const raw = search.get("callback");
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:") return null;
  if (!LOOPBACK_HOSTS.has(url.hostname)) return null;
  if (url.pathname !== "/callback") return null;

  url.searchParams.set("token", token);
  url.searchParams.set("username", username);

  const state = search.get("state");
  if (state) url.searchParams.set("state", state);

  return url.toString();
}
