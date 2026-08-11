import { notFound } from "next/navigation";

/**
 * Catch-all inside a locale.
 *
 * Without this, an unmatched path never reaches the localized not-found page
 * and Next falls back to its bare default. This routes /shop, /ru/forum and
 * friends into the translated 404 until those sections are built.
 *
 * Known limitation: the response carries a 200 rather than a 404. The intl
 * middleware rewrites /shop to /uz/shop, and the status of the rewritten
 * render is not propagated. Removing this file does not fix it -- the status
 * is 200 either way, only the page becomes untranslated -- so the localized
 * body is the better trade until the rewrite behaviour is addressed.
 */
export default function CatchAllPage() {
  notFound();
}
