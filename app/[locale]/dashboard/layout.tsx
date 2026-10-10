"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  Gamepad2,
  LayoutDashboard,
  Server,
  Newspaper,
  Users,
  LogOut,
  Loader2,
  Boxes,
  ShieldAlert,
  Settings2,
  Menu,
  X,
} from "lucide-react";
import {
  AdminAuthProvider,
  useAdminAuthContext,
} from "@/lib/admin-auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "overview" },
  { href: "/dashboard/minecraft", icon: Boxes, label: "minecraft" },
  { href: "/dashboard/server-types", icon: Settings2, label: "serverTypes" },
  { href: "/dashboard/servers", icon: Server, label: "publicServers" },
  { href: "/dashboard/news", icon: Newspaper, label: "news" },
  { href: "/dashboard/users", icon: Users, label: "users" },
] as const;

function DashboardNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const { user, logout } = useAdminAuthContext();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-6"
      >
        <span className="flex size-10 items-center justify-center bg-primary text-primary-foreground">
          <Gamepad2 className="size-5" />
        </span>
        <span>
          <span className="text-base font-bold tracking-tight">
            <span className="text-primary">CYBER</span>CRAFT
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {t("adminPanel")}
          </span>
        </span>
      </Link>
      <nav
        aria-label={t("navigation")}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3"
      >
        {sidebarLinks.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 border-l-2 px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${active ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{t(label)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center bg-muted font-semibold text-foreground">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-muted-foreground">
              {t(user?.is_superuser ? "superAdmin" : "admin")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="min-h-11 w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 size-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}

function DashboardContent({ children }: { children: ReactNode }) {
  const t = useTranslations("dashboard");
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoading, isAuthenticated, isAdmin, logout } = useAdminAuthContext();
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated)
      router.replace("/admin-login");
  }, [mounted, isLoading, isAuthenticated, router]);
  if (!mounted || isLoading)
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-background"
        role="status"
        aria-label={t("loading")}
      >
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  if (!isAuthenticated) return null;
  if (!isAdmin)
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-md space-y-4 text-center">
          <ShieldAlert className="mx-auto size-12 text-destructive" />
          <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
          <p className="text-muted-foreground">{t("adminRequired")}</p>
          <Button onClick={logout}>{t("logout")}</Button>
        </div>
      </div>
    );
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#dashboard-main"
        className="sr-only z-[60] bg-background p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("skipContent")}
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-sidebar lg:block">
        <DashboardNavigation />
      </aside>
      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11"
                aria-label={t("openMenu")}
              >
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="top-0 left-0 flex h-dvh w-[min(20rem,85vw)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 bg-sidebar p-0 sm:max-w-none"
            >
              <DialogTitle className="sr-only">{t("navigation")}</DialogTitle>
              <DialogDescription className="sr-only">
                {t("adminPanel")}
              </DialogDescription>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("closeMenu")}
                  className="absolute top-2 right-2 size-11"
                >
                  <X className="size-5" />
                </Button>
              </DialogClose>
              <DashboardNavigation onNavigate={() => setMenuOpen(false)} />
            </DialogContent>
          </Dialog>
          <span className="text-sm font-semibold">
            CyberCraft{" "}
            <span className="text-muted-foreground">/ {t("adminPanel")}</span>
          </span>
        </header>
        <main
          id="dashboard-main"
          tabIndex={-1}
          className="min-w-0 outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AdminAuthProvider>
  );
}
