"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import {
  User,
  Download,
  Gamepad2,
  LogOut,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/NotificationBell";
import { useTranslations } from "next-intl";
import { LauncherDownloadModal } from "@/components/launcher-download-modal";
import { LocaleSwitcher } from "@/components/locale-switcher";

import { siteLinks as navLinks } from "@/components/site-links";

export function Header() {
  const t = useTranslations("nav");
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("/");
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track active section via scroll position
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(pathname);
      return;
    }

    const sectionIds = ["voting", "news", "servers"]; // bottom-to-top order

    const handleScroll = () => {
      if (typeof window !== "undefined" && window.scrollY < 100) {
        setActiveSection("/");
        return;
      }
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Section is active when its top is above 200px from viewport top
          if (rect.top <= 200) {
            setActiveSection(`/#${id}`);
            return;
          }
        }
      }
      // No section reached the threshold — we're at the top
      setActiveSection("/");
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Update indicator position when activeSection changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeLink = linkRefs.current.get(activeSection);
      const navEl = navRef.current;

      if (activeLink && navEl) {
        const navRect = navEl.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();

        setIndicatorStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
          opacity: 1,
        });
      } else {
        setIndicatorStyle({ opacity: 0 });
      }
    };

    updateIndicator();

    // Also update on resize
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection, mounted]);

  // Smooth scroll handler for same-page hash transitions
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // 1. Same-page hash scrolling
      if (href.startsWith("/#") && pathname === "/") {
        const hash = href.slice(1); // e.g. "#servers"
        const el = document.querySelector(hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(
            null,
            "",
            `${window.location.pathname}${hash}`,
          );
        }
      }
      // 2. Same-page home click to top
      else if (href === "/" && pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", window.location.pathname);
      }
    },
    [pathname],
  );

  // Cross-page scroll handling once homepage mounts
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const hash = window.location.hash;
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const openLauncher = () => {
    setLauncherOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const canAccessDashboard = user?.is_staff || user?.is_superuser;

  const renderAuthSection = () => {
    if (!mounted || isLoading) {
      return (
        <Button className="cyber-btn px-6" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t("loading")}
        </Button>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex shrink-0 items-center gap-1 2xl:gap-2">
          {user.cc_balance !== undefined && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30">
              <span className="text-[var(--primary)] font-bold">
                {user.cc_balance}
              </span>
              <span className="text-[var(--text-secondary)] text-xs">CC</span>
            </div>
          )}
          <NotificationBell />
          {canAccessDashboard && (
            <Link href="/admin-login">
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                title={t("cabinet")}
              >
                <LayoutDashboard className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <Link href="/cabinet">
            <Button
              variant="ghost"
              className="max-w-32 gap-2 px-2 text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 2xl:max-w-44"
              title={user.username}
            >
              {user.skin_face_url ? (
                <div className="w-6 h-6 rounded overflow-hidden">
                  <Image
                    src={user.skin_face_url || "/placeholder.svg"}
                    alt={user.username}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                    unoptimized
                  />
                </div>
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="truncate">{user.username}</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--text-secondary)] hover:text-error hover:bg-error/10"
            onClick={handleLogout}
            aria-label={t("logout")}
            title={t("logout")}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <Link href="/login">
        <Button className="cyber-btn px-6">
          <User className="w-4 h-4 mr-2" />
          {t("login")}
        </Button>
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="group flex shrink-0 items-center gap-2 2xl:gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box">
                <Gamepad2 className="w-6 h-6 text-[var(--bg-dark)]" />
              </div>
              <span className="font-pixel text-[13px] leading-none">
                <span className="text-[var(--primary)]">CYBER</span>
                <span className="text-[var(--text-primary)]">CRAFT</span>
              </span>
            </Link>

            <nav
              ref={navRef}
              className="relative hidden shrink-0 items-center gap-0 xl:flex 2xl:gap-1"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isHashLink = link.href.startsWith("/#");
                const isActive = activeSection === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={
                      isActive ? (isHashLink ? "location" : "page") : undefined
                    }
                    scroll={isHashLink ? false : undefined}
                    onClick={(e) => handleNavClick(e, link.href)}
                    ref={(el) => {
                      if (el) linkRefs.current.set(link.href, el);
                      else linkRefs.current.delete(link.href);
                    }}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-2 py-2 text-sm 2xl:gap-2 2xl:px-4 2xl:text-base rounded-lg transition-colors duration-200 relative z-10 ${
                      isActive
                        ? "text-[var(--primary)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(link.key)}
                  </Link>
                );
              })}
              {/* Sliding active indicator */}
              <div className="nav-active-indicator" style={indicatorStyle} />
            </nav>

            <div className="hidden shrink-0 items-center gap-1 xl:flex 2xl:gap-3">
              <Button
                variant="outline"
                onClick={openLauncher}
                aria-label={t("launcher")}
                title={t("launcher")}
                className="h-10 px-3 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--bg-dark)] bg-transparent transition-all duration-300"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span className="hidden 2xl:inline">{t("launcher")}</span>
              </Button>

              <LocaleSwitcher />
              {renderAuthSection()}
            </div>

            <div className="xl:hidden [&_button]:min-h-11">
              <LocaleSwitcher compact />
            </div>
          </div>
        </div>
      </header>
      <LauncherDownloadModal
        isOpen={launcherOpen}
        onClose={() => setLauncherOpen(false)}
      />
    </>
  );
}
