"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, Loader2, Newspaper } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useNews } from "@/lib/api/hooks";

/**
 * News index.
 *
 * Both "Barcha yangiliklar" links -- the section heading and the footer of
 * the news block -- pointed here, but only /news/[id] existed, so every
 * visitor who followed them hit a 404.
 */
export default function NewsIndexPage() {
  const t = useTranslations("newsIndex");
  const { news, isLoading, isError } = useNews();

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <Header />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
            {t("title")}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t("subtitle")}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-[var(--text-secondary)]">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            {t("loading")}
          </div>
        )}

        {isError && !isLoading && (
          <div className="cyber-card p-10 text-center text-[var(--text-secondary)]">
            {t("error")}
          </div>
        )}

        {!isLoading && !isError && news.length === 0 && (
          <div className="cyber-card p-10 text-center">
            <Newspaper className="w-10 h-10 mx-auto mb-4 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)]">
              {t("empty")}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item: any) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="cyber-card overflow-hidden group flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-[var(--bg-card)]">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex flex-col flex-1">
                {item.category?.name && (
                  <span
                    className="self-start text-xs px-2 py-1 rounded mb-3 border"
                    style={{
                      color: item.category.color || "var(--primary)",
                      borderColor: `${item.category.color || "#00f0ff"}55`,
                    }}
                  >
                    {item.category.name}
                  </span>
                )}

                <h2 className="font-bold text-lg text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                  {item.title}
                </h2>

                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 flex-1">
                  {item.excerpt}
                </p>

                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-4">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("uz-UZ")
                    : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
