"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { href: '/cabinet/profile', label: 'Umumiy', icon: User },
  { href: '/cabinet/statistics', label: 'Statistika', icon: BarChart3 },
  { href: '/cabinet/notifications', label: 'Bildirishnomalar', icon: Bell },
  { href: '/cabinet/donate', label: 'Donates', icon: Gift },
  { href: '/cabinet/settings', label: 'Sozlamalar', icon: Settings },
  { href: '/cabinet/balance', label: "Balans va To'lovlar", icon: Wallet },
  { href: '/cabinet/transactions', label: 'Tranzaksiyalar', icon: ScrollText },
  { href: '/cabinet/servers', label: 'Serverlar', icon: Server },
  { href: '/cabinet/bonus', label: 'Bonus', icon: Sparkles },
];

interface CabinetSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CabinetSidebar({ isOpen = true, onClose }: CabinetSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 
          border-r border-[var(--border-color)] bg-[var(--bg-dark)]
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:top-16
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        {onClose && (
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] lg:hidden">
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              Menyu
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[var(--text-secondary)]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary-dark)]/20 text-[var(--primary)] border-l-4  shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--primary)]' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] text-center">
            <p>CyberCraft Cabinet</p>
            <p className="mt-1">v2.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
