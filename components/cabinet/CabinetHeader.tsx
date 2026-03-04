"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CabinetHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();


  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Bosh sahifa' },
    { href: '/#servers', label: 'Serverlar' },
    { href: '/#news', label: 'Yangiliklar' },
    { href: '/#voting', label: 'Ovoz berish' },
    { href: '/shop', label: "Do'kon" },
    { href: '/forum', label: 'Forum' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-dark)] backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-dark)]/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[var(--text-primary)]"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center">
              <span className="font-bold text-sm">CC</span>
            </div>
            <span className="hidden sm:inline-block text-xl font-bold text-[var(--text-primary)]">
              CyberCraft
            </span>
          </Link>
        </div>

        {/* Center: Main Navigation (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors duration-200 rounded-lg hover:bg-[var(--primary)]/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: User Info and Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {user.username}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {user.cc_balance ?? 0} CC
                  </p>
                </div>
              </div>
            </div>
          )}



          {/* User Menu Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--bg-card)] border-[var(--border-color)]">
                <DropdownMenuLabel className="text-[var(--text-primary)]">
                  Mening akkauntim
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--border-color)]" />
                <DropdownMenuItem
                  onClick={() => router.push('/cabinet/profile')}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/cabinet/settings')}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Sozlamalar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--border-color)]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
