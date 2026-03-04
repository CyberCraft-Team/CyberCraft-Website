"use client";

import { Users, Copy, Check, Gamepad2, Loader2, WifiOff, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useServers } from "@/lib/api/hooks";
import type { Server } from "@/lib/api/types";

export function ServersSection() {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { servers: apiServers, isLoading, isError } = useServers();

  const copyIP = (id: number, ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 mb-4">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--primary)] font-medium">Eng yaxshi serverlar</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-[var(--text-primary)]">BIZNING </span>
            <span className="text-[var(--primary)] neon-cyan">SERVERLAR</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {apiServers.map((server) => (
              <div
                key={server.id}
                className="cyber-card p-6 group relative overflow-hidden"
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
                        className={`w - 2.5 h - 2.5 rounded - full ${getStatusColor(server.status)} animate - pulse`}
                      />
                      <span
                        className={`text - xs uppercase font - bold ${server.status === "online"
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

                  {/* IP and action buttons */}
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-[var(--bg-dark)] rounded-lg text-sm text-[var(--primary)] font-mono border border-[var(--border-color)] truncate">
                      {server.ip_address}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 w-12 h-12 hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
                      onClick={() => copyIP(server.id, server.ip_address)}
                    >
                      {copiedId === server.id ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                    <Button
                      className="cyber-btn px-6 h-12 font-bold"
                      disabled={server.status !== "online"}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      O'ynash
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
