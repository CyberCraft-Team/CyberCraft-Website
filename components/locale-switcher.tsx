"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Language switcher.
 *
 * usePathname from @/i18n/navigation returns the path *without* the locale
 * prefix, so replacing the locale keeps the visitor on the same page rather
 * than sending them back to the homepage.
 */
export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("locale");
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const select = (next: Locale) => {
    if (next === current) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={t("switch")}
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50"
      >
        <Globe className="w-4 h-4" />
        {!compact && (
          <span className="text-sm uppercase">{current}</span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[var(--bg-card)] border-[var(--border-color)]"
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => select(locale)}
            className="cursor-pointer text-[var(--text-secondary)] focus:text-[var(--primary)] flex items-center justify-between gap-6"
          >
            {t(locale)}
            {locale === current && (
              <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
