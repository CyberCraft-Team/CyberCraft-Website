"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  BarChart3,
  Gift,
  Settings,
  Wallet,
  ScrollText,
  Server,
  Sparkles,
  Bell,
} from "lucide-react";

export const cabinetLinks = [
  { href: "/cabinet/profile", label: "profile", icon: User },
  { href: "/cabinet/statistics", label: "statistics", icon: BarChart3 },
  { href: "/cabinet/notifications", label: "notifications", icon: Bell },
  { href: "/cabinet/donate", label: "donate", icon: Gift },
  { href: "/cabinet/settings", label: "settings", icon: Settings },
  { href: "/cabinet/balance", label: "balance", icon: Wallet },
  { href: "/cabinet/transactions", label: "transactions", icon: ScrollText },
  { href: "/cabinet/servers", label: "servers", icon: Server },
  { href: "/cabinet/bonus", label: "bonus", icon: Sparkles },
] as const;

export function isCabinetLinkActive(pathname: string, href: string) {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/cabinet/profile" && pathname === "/cabinet")
  );
}

export default function CabinetSidebar() {
  const pathname = usePathname();
  const t = useTranslations("cabinetNavigation");
  return (
    <aside className="fixed top-16 left-0 z-40 hidden h-[calc(100dvh-4rem)] w-64 flex-col border-r border-border bg-background lg:flex">
      <nav
        aria-label={t("navigation")}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-1 p-4"
      >
        {cabinetLinks.map(({ href, label, icon: Icon }) => {
          const active = isCabinetLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 border-l-2 px-4 py-3 text-sm font-medium transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground"}`}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span>{t(label)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-border p-4 text-center text-xs text-muted-foreground">
        <p>CyberCraft Cabinet</p>
        <p className="mt-1">v1.0</p>
      </div>
    </aside>
  );
}
