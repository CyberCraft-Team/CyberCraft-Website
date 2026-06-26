"use client";

import { Users, Gamepad2, Loader2, WifiOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useServers } from "@/lib/api/hooks";
import type { Server } from "@/lib/api/types";
import { useScrollRevealGroup } from "@/hooks/use-scroll-reveal";

export function ServersSection() {
  const { servers: apiServers, isLoading, isError } = useServers();
  const headerRevealRef = useScrollRevealGroup({ threshold: 0.2 });
  const gridRevealRef = useScrollRevealGroup({ threshold: 0.05 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "status-online";
      case "offline":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "maintenance":
        return "Texnik ishlar";
      default:
        return status;
    }
  };

  const getPlayerPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--bg-dark)] to-[#0d1015]" id="servers">
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-14"
          ref={headerRevealRef as React.RefObject<HTMLDivElement>}
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            data-reveal="fade-up"
            data-delay="0"
          >
            <span className="text-[var(--text-primary)]">BIZNING </span>
            <span className="text-[var(--primary)] neon-cyan">SERVERLAR</span>
          </h2>
          <p
            className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg"
            data-reveal="fade-up"
            data-delay="150"
          >
            O'zingizga mos serverni tanlang va sarguzashtni boshlang!
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
            <span className="text-[var(--text-secondary)]">
              Serverlar yuklanmoqda...
            </span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex items-center justify-center gap-2 py-4 mb-6 text-[var(--warning)] bg-[var(--warning)]/10 rounded-lg border border-[var(--warning)]/30">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm">
              API bilan bog'lanib bo'lmadi. Keyinroq urinib ko'ring.
            </span>
          </div>
        )}

        {!isLoading && apiServers.length === 0 && !isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center mb-6">
              <Gamepad2 className="w-10 h-10 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Hozircha serverlar yo'q
            </h3>
            <p className="text-[var(--text-secondary)]">
              Tez orada serverlar qo'shiladi. Kuzatib boring!
            </p>
          </div>
        )}

        {!isLoading && apiServers.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            ref={gridRevealRef as React.RefObject<HTMLDivElement>}
          >
            {apiServers.map((server, index) => (
              <div
                key={server.id}
                className="cyber-card p-6 group relative overflow-hidden"
                data-reveal="fade-up"
                data-delay={String(index * 150)}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {server.icon_url ? (
                          <Image
                            src={server.icon_url || "/placeholder.svg"}
                            alt={server.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded"
                          />
                        ) : (
                          <Gamepad2 className="w-7 h-7 text-[var(--primary)]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {server.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                          {server.description || "Minecraft server"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${getStatusColor(server.status)} animate-pulse`}
                      />
                      <span
                        className={`text-xs uppercase font-bold ${server.status === "online"
                            ? "text-green-400"
                            : server.status === "offline"
                              ? "text-red-500"
                              : "text-yellow-500"
                          } `}
                      >
                        {getStatusText(server.status)}
                      </span>
                    </div>
                  </div>

                  {/* Modpack badge */}
                  {server.modpack_name && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-full border border-[var(--primary)]/30">
                        {server.modpack_name} v{server.modpack_version}
                      </span>
                    </div>
                  )}

                  {/* Version */}
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                    <span>Minecraft</span>
                    <span className="px-2 py-0.5 bg-[var(--bg-dark)] rounded text-[var(--text-primary)] font-medium">
                      {server.minecraft_version || "1.20.4"}
                    </span>
                  </div>

                  {/* Players progress */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">O'yinchilar</span>
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        <span className="text-[var(--primary)]">{server.current_players}</span>
                        <span className="text-[var(--text-secondary)]"> / {server.max_players}</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-[var(--bg-dark)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${getPlayerPercentage(server.current_players, server.max_players)}% `,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      className="cyber-btn w-full h-12 font-bold animate-pulse-glow"
                      disabled={server.status !== "online"}
                    >
                      <Gamepad2 className="w-5 h-5 mr-2" />
                      Launcherdan o'ynash
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
