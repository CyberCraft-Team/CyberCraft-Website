"use client";

import Link from "next/link";
import { Youtube, Send, MessageCircle, Gamepad2, ExternalLink, Globe, Music, Instagram, Twitter } from "lucide-react";
import { useSocialLinks } from "@/lib/api/hooks";
import type { SocialLink } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";

const links = {
  server: [
    { name: "Serverlar", href: "#servers" },
    { name: "Yangiliklar", href: "#news" },
    { name: "Do'kon", href: "/shop" },
    { name: "Forum", href: "/forum" },
  ],
  help: [
    { name: "Qoidalar", href: "/rules" },
    { name: "FAQ", href: "/faq" },
    { name: "Yordam", href: "/support" },
    { name: "Aloqa", href: "/contact" },
  ],
  legal: [
    { name: "Maxfiylik siyosati", href: "/privacy" },
    { name: "Foydalanish shartlari", href: "/terms" },
  ],
};

const platformIcons: Record<string, LucideIcon> = {
  youtube: Youtube,
  telegram: Send,
  discord: MessageCircle,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  other: Globe,
};

const platformColors: Record<string, string> = {
  youtube: "hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50",
  telegram: "hover:bg-blue-500/20 hover:text-blue-500 hover:border-blue-500/50",
  discord: "hover:bg-indigo-500/20 hover:text-indigo-500 hover:border-indigo-500/50",
  instagram: "hover:bg-pink-500/20 hover:text-pink-500 hover:border-pink-500/50",
  tiktok: "hover:bg-cyan-500/20 hover:text-cyan-500 hover:border-cyan-500/50",
  twitter: "hover:bg-sky-500/20 hover:text-sky-500 hover:border-sky-500/50",
  other: "hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] hover:border-[var(--primary)]/50",
};

function getSocialIcon(link: SocialLink): LucideIcon {
  return platformIcons[link.platform] || Globe;
}

function getSocialColor(link: SocialLink): string {
  if (link.color) return link.color;
  return platformColors[link.platform] || platformColors.other;
}

export function Footer() {
  const { socialLinks } = useSocialLinks();

  return (
    <footer className="bg-[var(--bg-dark)] border-t border-[var(--border-color)]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box">
                <Gamepad2 className="w-6 h-6 text-[var(--bg-dark)]" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-[var(--primary)]">CYBER</span>
                <span className="text-[var(--text-primary)]">CRAFT</span>
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm leading-relaxed">
              O'zbekistondagi eng yaxshi Minecraft server kompleksi.
              Texnik modlar, survival va boshqa ko'plab rejimlar!
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = getSocialIcon(social);
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] transition-all ${getSocialColor(social)}`}
                      title={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Server Links */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-5 text-sm uppercase tracking-wider">
              Server
            </h4>
            <ul className="space-y-3">
              {links.server.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-5 text-sm uppercase tracking-wider">
              Yordam
            </h4>
            <ul className="space-y-3">
              {links.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — dynamic from social links */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-5 text-sm uppercase tracking-wider">
              Aloqa
            </h4>
            <ul className="space-y-3 text-[var(--text-secondary)]">
              {socialLinks.map((social) => (
                <li key={social.id} className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">{social.name}:</span>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors truncate">
                    {social.url.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              ))}
              {socialLinks.length === 0 && (
                <li className="text-[var(--text-secondary)] text-sm opacity-50">
                  Aloqa ma'lumotlari yuklanmoqda...
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-secondary)]">
              © 2024-2026 <span className="text-[var(--primary)]">CyberCraft</span>. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-4">
              {links.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]/60 mt-4 text-center md:text-left">
            Minecraft - Mojang Studios tomonidan ishlab chiqilgan. CyberCraft rasmiy Mojang mahsuloti emas.
          </p>
        </div>
      </div>
    </footer>
  );
}
