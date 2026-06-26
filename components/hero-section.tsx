"use client";

import {
  Users,
  Server,
  Trophy,
  Download,
  ChevronRight,
  Loader2,
  Play,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStats } from "@/lib/api/hooks";
import { ParticlesBackground } from "@/components/particles-background";
import { useScrollRevealGroup } from "@/hooks/use-scroll-reveal";

export function HeroSection() {
  const { stats, isLoading, isError } = useStats();
  const revealRef = useScrollRevealGroup({ threshold: 0.1, rootMargin: "0px" });

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-dark)] via-[#0d1015] to-[var(--bg-dark)]" />

      {/* Particles */}
      <ParticlesBackground />

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%20fill%3D%22none%22%20stroke%3D%22%231a1f2e%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center max-w-5xl mx-auto"
          ref={revealRef as React.RefObject<HTMLDivElement>}
        >
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-float"
            data-reveal="fade-down"
            data-delay="0"
          >
            {isError ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm text-red-400 font-medium">
                  Serverga ulanib bo'lmadi
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full status-online animate-pulse" />
                <span className="text-sm text-[var(--text-secondary)] font-medium">
                  Serverlar ishlayapti • {isLoading ? "..." : stats?.online_players ?? "--"} ta o'yinchi online
                </span>
              </>
            )}
          </div>

          <h1
            className="glitch text-6xl md:text-8xl font-black mb-6 tracking-tight"
            data-text="CYBERCRAFT"
            data-reveal="blur-in"
            data-delay="150"
          >
            <span className="text-[var(--text-primary)]">CYBER</span>
            <span className="text-[var(--primary)]">CRAFT</span>
          </h1>

          {/* Stats cards */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
            <div
              className="cyber-card flex items-center gap-4 px-5 py-4 md:px-6 md:py-5"
              data-reveal="fade-up"
              data-delay="300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-[var(--primary)]" />
              </div>
              <div className="text-left">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                ) : isError ? (
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-secondary)]">--</p>
                ) : (
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] neon-cyan">
                    {stats?.online_players ?? "--"}
                  </p>
                )}
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">Hozir onlayn</p>
              </div>
            </div>

            <div
              className="cyber-card flex items-center gap-4 px-5 py-4 md:px-6 md:py-5"
              data-reveal="fade-up"
              data-delay="400"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 md:w-7 md:h-7 text-[var(--accent)]" />
              </div>
              <div className="text-left">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                ) : isError ? (
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-secondary)]">--</p>
                ) : (
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] neon-cyan">
                    {stats?.max_online ?? "--"}
                  </p>
                )}
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">Rekord onlayn</p>
              </div>
            </div>

            <div
              className="cyber-card flex items-center gap-4 px-5 py-4 md:px-6 md:py-5"
              data-reveal="fade-up"
              data-delay="500"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[var(--secondary)]/20 flex items-center justify-center">
                <Server className="w-6 h-6 md:w-7 md:h-7 text-[var(--secondary)]" />
              </div>
              <div className="text-left">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-[var(--secondary)] animate-spin" />
                ) : isError ? (
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-secondary)]">--</p>
                ) : (
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] neon-cyan">
                    {stats?.total_registered?.toLocaleString() ?? "--"}
                  </p>
                )}
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">Ro'yxatdan o'tgan</p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {isError && (
            <div className="flex items-center justify-center gap-2 mb-6 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>API serveriga ulanishda xatolik yuz berdi</span>
            </div>
          )}

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row justify-center gap-4"
            data-reveal="fade-up"
            data-delay="600"
          >
            <Button
              size="lg"
              className="cyber-btn px-10 py-7 text-lg font-bold animate-pulse-glow group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              LAUNCHER YUKLASH
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] bg-transparent/50 backdrop-blur-sm px-10 py-7 text-lg transition-all group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Qanday o'ynash
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
