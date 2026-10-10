"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Ellipsis, X, Home, LogOut } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { cabinetLinks, isCabinetLinkActive } from "./CabinetSidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const primary = ["profile", "servers", "balance", "bonus"];
const tabs = primary.map(
  (key) => cabinetLinks.find((link) => link.label === key)!,
);

export default function CabinetMobileNavigation() {
  const t = useTranslations("cabinetNavigation");
  const n = useTranslations("nav");
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  const moreActive = cabinetLinks.some(
    (link) =>
      !primary.includes(link.label) && isCabinetLinkActive(pathname, link.href),
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <nav
        data-mobile-bottom-navigation="lg"
        aria-label={t("navigation")}
        className="mobile-bottom-navigation lg:hidden"
      >
        <div className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isCabinetLinkActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`mobile-bottom-item ${active ? "mobile-bottom-item-active" : ""}`}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="max-w-full truncate">{t(label)}</span>
              </Link>
            );
          })}
          <DialogTrigger asChild>
            <button
              aria-label={n("openMenu")}
              className={`mobile-bottom-item ${open || moreActive ? "mobile-bottom-item-active" : ""}`}
            >
              <Ellipsis aria-hidden="true" className="size-5" />
              <span>{n("more")}</span>
            </button>
          </DialogTrigger>
        </div>
      </nav>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="mobile-navigation-sheet translate-x-0 translate-y-0 lg:hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <DialogTitle>{t("navigation")}</DialogTitle>
          <DialogClose asChild>
            <button
              aria-label={n("closeMenu")}
              className="flex size-11 items-center justify-center hover:bg-primary/10"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-1 p-4">
          {cabinetLinks
            .filter((link) => !primary.includes(link.label))
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={
                  isCabinetLinkActive(pathname, href) ? "page" : undefined
                }
                className={`flex min-h-11 items-center gap-3 px-3 py-3 text-sm ${isCabinetLinkActive(pathname, href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Icon aria-hidden="true" className="size-4" />
                {t(label)}
              </Link>
            ))}
          <div className="mt-3 border-t border-border pt-3">
            <Link
              href="/"
              className="flex min-h-11 items-center gap-3 px-3 py-3 text-sm text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <Home className="size-4" />
              {n("home")}
            </Link>
            {isAuthenticated && (
              <Button
                variant="ghost"
                className="min-h-11 w-full justify-start text-destructive"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                }}
              >
                <LogOut className="mr-3 size-4" />
                {n("logout")}
              </Button>
            )}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
