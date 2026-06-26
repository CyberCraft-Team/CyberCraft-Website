"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  Download,
  Gamepad2,
  LogOut,
  Loader2,
  LayoutDashboard,
  Home,
  Server,
  Newspaper,
  Vote,
  ShoppingCart,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/NotificationBell";

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/#servers", label: "Serverlar", icon: Server },
  { href: "/#news", label: "Yangiliklar", icon: Newspaper },
  { href: "/#voting", label: "Ovoz berish", icon: Vote },
  { href: "/shop", label: "Do'kon", icon: ShoppingCart },
  { href: "/forum", label: "Forum", icon: MessageSquare },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
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
          window.history.pushState(null, "", href);
          setIsOpen(false);
        }
      }
      // 2. Same-page home click to top
      else if (href === "/" && pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
        setIsOpen(false);
      }
    },
    [pathname]
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

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const canAccessDashboard = user?.is_staff || user?.is_superuser;

  const renderAuthSection = () => {
    if (!mounted || isLoading) {
      return (
        <Button className="cyber-btn px-6" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Yuklanmoqda
        </Button>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-2">
          {user.cc_balance !== undefined && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30">
              <span className="text-[var(--primary)] font-bold">{user.cc_balance}</span>
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
                title="Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <Link href="/cabinet">
            <Button
              variant="ghost"
              className="text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 gap-2"
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
              {user.username}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10"
            onClick={handleLogout}
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
          Kirish
        </Button>
      </Link>
    );
  };

  const renderMobileAuthSection = () => {
    if (!mounted || isLoading) {
      return (
        <Button className="flex-1 cyber-btn" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Yuklanmoqda
        </Button>
      );
    }

    if (isAuthenticated && user) {
      return (
        <Button
          className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Chiqish
        </Button>
      );
    }

    return (
      <Link href="/login" className="flex-1">
        <Button className="w-full cyber-btn">
          <User className="w-4 h-4 mr-2" />
          Kirish
        </Button>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border-color)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box">
              <Gamepad2 className="w-6 h-6 text-[var(--bg-dark)]" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-[var(--primary)] neon-cyan">CYBER</span>
              <span className="text-[var(--text-primary)]">CRAFT</span>
            </span>
          </Link>

          <nav ref={navRef} className="hidden lg:flex items-center gap-1 relative">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isHashLink = link.href.startsWith("/#");
              const isActive = activeSection === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  scroll={isHashLink ? false : undefined}
                  onClick={(e) => handleNavClick(e, link.href)}
                  ref={(el) => {
                    if (el) linkRefs.current.set(link.href, el);
                    else linkRefs.current.delete(link.href);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 relative z-10 ${
                    isActive
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            {/* Sliding active indicator */}
            <div
              className="nav-active-indicator"
              style={indicatorStyle}
            />
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--bg-dark)] bg-transparent transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Launcher
            </Button>

            {renderAuthSection()}
          </div>

          <button
            className="lg:hidden text-[var(--text-primary)] p-2 hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 lg:hidden py-4 px-4 border-b border-[var(--border-color)] glass animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isHashLink = link.href.startsWith("/#");
                const isActive = activeSection === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    scroll={isHashLink ? false : undefined}
                    onClick={(e) => {
                      handleNavClick(e, link.href);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-[var(--primary)] bg-[var(--primary)]/10 border-l-2 border-[var(--primary)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              {mounted && canAccessDashboard && (
                <Link
                  href="/admin-login"
                  className="px-4 py-3 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              <div className="flex gap-2 pt-4 mt-2 border-t border-[var(--border-color)]">
                <Button
                  variant="outline"
                  className="flex-1 border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-[var(--bg-dark)]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Launcher
                </Button>
                {renderMobileAuthSection()}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
