import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

/**
 * 404 page.
 *
 * Several navigation entries point at sections that are not built yet --
 * the shop, the forum, the rules and support pages. Until those land, they
 * should arrive somewhere that looks like the site rather than at Next's
 * bare default error page.
 */
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center px-4">
      <div className="cyber-card max-w-lg w-full p-10 text-center">
        <p className="text-7xl font-black gradient-text mb-2">404</p>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          {t("title")}
        </h1>

        <p className="text-[var(--text-secondary)] mb-8">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="cyber-btn px-6 py-3 rounded-lg font-medium">
            {t("home")}
          </Link>
          <Link
            href="/news"
            className="px-6 py-3 rounded-lg font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
          >
            {t("news")}
          </Link>
        </div>
      </div>
    </main>
  );
}
