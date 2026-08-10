/**
 * Session cookie names.
 *
 * Kept in their own module with no imports: middleware runs in the edge
 * runtime, where `next/headers` is unavailable, so it cannot pull in
 * lib/server/session.ts just to learn a string.
 */

export const USER_COOKIE = "cc_session";
export const ADMIN_COOKIE = "cc_admin";
