"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Ellipsis,
  User,
  X,
  Download,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { siteLinks } from "@/components/site-links";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LauncherDownloadModal } from "@/components/launcher-download-modal";

export function MobileNavigation() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [section, setSection] = useState("/");
  const pendingScroll = useRef<string | null>(null);
  const contextual =
    pathname.startsWith("/dashboard") || pathname.startsWith("/cabinet");
  useEffect(() => {
    if (pathname !== "/") return;
    const update = () => {
      const active = ["voting", "news", "servers"].find(
        (id) =>
          (document.getElementById(id)?.getBoundingClientRect().top ??
            Infinity) <= 200,
      );
      setSection(window.scrollY < 100 || !active ? "/" : `/#${active}`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  if (contextual) return null;
  const active = pathname === "/" ? section : pathname;
  const accountRoute = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/admin-login",
  ].includes(pathname);
  const linkActive = (href: string) =>
    active === href ||
    (href === "/#news" &&
      (pathname === "/news" || pathname.startsWith("/news/")));
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      pathname === "/" &&
      (href === "/" || href.startsWith("/#")) &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      const hash = href === "/" ? "" : href.slice(1);
      if (hash && !document.getElementById(hash.slice(1))) return;
      event.preventDefault();
      window.history.pushState(null, "", `${window.location.pathname}${hash}`);
      if (open) pendingScroll.current = hash || "/";
      else if (hash)
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpen(false);
  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <nav
          data-mobile-bottom-navigation="xl"
          aria-label={t("mobileNavigation")}
          className="mobile-bottom-navigation xl:hidden"
        >
          <div className="grid grid-cols-5">
            {siteLinks.slice(0, 3).map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                scroll={pathname === "/" ? false : undefined}
                onClick={(event) => navigate(event, href)}
                aria-current={
                  linkActive(href)
                    ? href.includes("#")
                      ? "location"
                      : "page"
                    : undefined
                }
                className={`mobile-bottom-item ${linkActive(href) ? "mobile-bottom-item-active" : ""}`}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="max-w-full truncate">{t(key)}</span>
              </Link>
            ))}
            <Link
              href={isAuthenticated ? "/cabinet" : "/login"}
              aria-current={accountRoute ? "page" : undefined}
              className={`mobile-bottom-item ${accountRoute ? "mobile-bottom-item-active" : ""}`}
            >
              <User aria-hidden="true" className="size-5" />
              <span className="max-w-full truncate">
                {t(isAuthenticated ? "cabinet" : "login")}
              </span>
            </Link>
            <DialogTrigger asChild>
              <button
                aria-label={t("openMenu")}
                className={`mobile-bottom-item ${open || siteLinks.slice(3).some((link) => link.href === active) ? "mobile-bottom-item-active" : ""}`}
              >
                <Ellipsis aria-hidden="true" className="size-5" />
                <span>{t("more")}</span>
              </button>
            </DialogTrigger>
          </div>
        </nav>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const target = pendingScroll.current;
            if (launcherOpen || target) event.preventDefault();
            if (target) {
              pendingScroll.current = null;
              requestAnimationFrame(() => {
                if (target === "/")
                  window.scrollTo({ top: 0, behavior: "smooth" });
                else
                  document
                    .getElementById(target.slice(1))
                    ?.scrollIntoView({ behavior: "smooth" });
              });
            }
          }}
          className="mobile-navigation-sheet translate-x-0 translate-y-0"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <DialogTitle>{t("menu")}</DialogTitle>
            <DialogClose asChild>
              <button
                aria-label={t("closeMenu")}
                className="flex size-11 items-center justify-center hover:bg-primary/10"
              >
                <X className="size-5" />
              </button>
            </DialogClose>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
            <nav className="space-y-1">
              {siteLinks.slice(3).map(({ href, key, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => navigate(event, href)}
                  aria-current={linkActive(href) ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 px-3 py-3 text-sm ${linkActive(href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Icon className="size-4" />
                  {t(key)}
                </Link>
              ))}
              {(user?.is_staff || user?.is_superuser) && (
                <Link
                  href="/admin-login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 px-3 py-3 text-sm text-primary"
                >
                  <LayoutDashboard className="size-4" />
                  {t("dashboard")}
                </Link>
              )}
            </nav>
            <div className="space-y-3 border-t border-border pt-4">
              <Button
                variant="outline"
                className="min-h-11 w-full border-primary text-primary"
                onClick={() => {
                  setOpen(false);
                  setLauncherOpen(true);
                }}
              >
                <Download className="mr-2 size-4" />
                {t("launcher")}
              </Button>
              <Button asChild className="min-h-11 w-full">
                <Link
                  href={isAuthenticated ? "/cabinet" : "/login"}
                  onClick={() => setOpen(false)}
                >
                  <User className="mr-2 size-4" />
                  <span className="truncate">
                    {isAuthenticated ? user?.username : t("login")}
                  </span>
                </Link>
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  className="min-h-11 w-full text-destructive"
                  onClick={async () => {
                    await logout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  {t("logout")}
                </Button>
              )}
              <div className="flex justify-center [&_button]:min-h-11">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <LauncherDownloadModal
        isOpen={launcherOpen}
        onClose={() => setLauncherOpen(false)}
      />
    </>
  );
}
