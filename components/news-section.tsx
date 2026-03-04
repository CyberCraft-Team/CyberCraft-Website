"use client";

import { CalendarDays, ChevronRight, Newspaper, Loader2, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useNews } from "@/lib/api/hooks";
import type { News } from "@/lib/api/types";

export function NewsSection() {
  const { news: apiNews, isLoading } = useNews();

  return (
    <section className="py-20 bg-[var(--bg-card)]" id="news">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                <span className="text-[var(--text-primary)]">SO'NGGI </span>
                <span className="text-[var(--primary)]">YANGILIKLAR</span>
              </h2>
            </div>
            <p className="text-[var(--text-secondary)]">
              Server yangiliklari va e'lonlar
            </p>
          </div>
          <Link
            href="/news"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors group"
          >
            Barcha yangiliklar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
            <span className="text-[var(--text-secondary)]">
              Yangiliklar yuklanmoqda...
            </span>
          </div>
        )}

        {!isLoading && apiNews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-dark)] flex items-center justify-center mb-6">
              <Newspaper className="w-10 h-10 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Yangiliklar topilmadi
            </h3>
            <p className="text-[var(--text-secondary)]">
              Tez orada yangiliklar qo'shiladi.
            </p>
          </div>
        )}

        {!isLoading && apiNews.length > 0 && (
          <>
            {/* Featured news grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiNews.slice(0, 6).map((item, index) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className={`cyber-card overflow-hidden group ${index === 0 ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                >
                  {/* Image placeholder */}
                  <div
                    className={`relative bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 ${index === 0 ? "h-48 md:h-64" : "h-36"
                      }`}
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-[var(--border-color)]" />
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm"
                        style={{
                          background: `color-mix(in srgb, ${item.category_color || 'var(--primary)'} 20%, transparent)`,
                          color: item.category_color || 'var(--primary)',
                          border: `1px solid ${item.category_color || 'var(--primary)'}40`
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 ${index === 0 ? "md:p-6" : ""}`}>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.date).toLocaleDateString("uz-UZ", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className={`font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors ${index === 0 ? "text-xl md:text-2xl" : "text-base"
                      }`}>
                      {item.title}
                    </h3>
                    {(index === 0 || index === 1 || index === 2) && (
                      <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-3 text-[var(--primary)] text-sm font-medium">
                      <span>O'qish</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile view all button */}
            <div className="md:hidden mt-8 text-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
              >
                Barcha yangiliklar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
