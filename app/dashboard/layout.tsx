"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Gamepad2,
  LayoutDashboard,
  Server,
  Newspaper,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  Boxes,
  ShieldAlert,
  Settings2,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuthContext } from "@/lib/admin-auth-context";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Bosh sahifa" },
  { href: "/dashboard/minecraft", icon: Boxes, label: "Minecraft Serverlar" },
  { href: "/dashboard/server-types", icon: Settings2, label: "Server Turlari" },
  { href: "/dashboard/servers", icon: Server, label: "Public Serverlar" },
  { href: "/dashboard/news", icon: Newspaper, label: "Yangiliklar" },
  { href: "/dashboard/users", icon: Users, label: "Foydalanuvchilar" },
  { href: "/dashboard/settings", icon: Settings, label: "Sozlamalar" },
];

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useAdminAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/admin-login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
        <div className="text-center p-8 cyber-card max-w-md">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Kirish taqiqlangan
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Admin paneliga kirish uchun admin huquqi talab qilinadi.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-[var(--border-color)]"
            >
              Bosh sahifaga
            </Button>
            <Button variant="destructive" onClick={logout}>
              Chiqish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-dark)]">
      <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-color)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-[var(--bg-dark)]" />
            </div>
            <div>
              <span className="text-lg font-bold">
                <span className="text-[var(--primary)]">CYBER</span>
                <span className="text-[var(--secondary)]">CRAFT</span>
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
                ? 'bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary-dark)]/20 text-[var(--primary)] border-l-4 border-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--primary)]/10'
                }`}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[var(--bg-dark)] font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.username}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {user?.is_superuser ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-[var(--text-secondary)] hover:text-red-500"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Chiqish
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AdminAuthProvider>
  );
}
