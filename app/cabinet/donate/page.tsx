"use client";

import { useRanks } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth-context";
import { getUserToken } from "@/lib/api/hooks";
import apiClient from "@/lib/api/client";
import { Loader2, Crown, Star, ShoppingCart, Coins, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DonatePage() {
  const { user } = useAuth();
  const { ranks, isLoading } = useRanks();
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handlePurchase = async (rankId: number, rankName: string) => {
    const token = getUserToken();
    if (!token) return;

    setPurchasing(rankId);
    setResult(null);
    try {
      await apiClient.purchaseRank(token, rankId);
      setResult({ type: "success", message: `${rankName} rank muvaffaqiyatli sotib olindi!` });
    } catch (err: any) {
      setResult({ type: "error", message: err.message || "Sotib olishda xatolik" });
    } finally {
      setPurchasing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Donate — Ranklar
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          CyberCoin sarflab maxsus ranklar sotib oling
        </p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg border text-center font-medium ${result.type === "success"
              ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
              : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
        >
          {result.message}
        </div>
      )}

      {ranks.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Ranklar mavjud emas
          </h2>
          <p className="text-[var(--text-secondary)]">
            Hozircha sotib olinadigan ranklar yo'q
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranks
            .sort((a, b) => a.priority - b.priority)
            .map((rank) => (
              <div
                key={rank.id}
                className="cyber-card p-6 flex flex-col group hover:border-[var(--primary)]/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${rank.color_code}20` }}
                  >
                    <Star
                      className="w-6 h-6"
                      style={{ color: rank.color_code }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: rank.color_code }}
                    >
                      {rank.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Prioritet: {rank.priority}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
                  <Coins className="w-5 h-5 text-[var(--warning)]" />
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    {rank.price}
                  </span>
                  <span className="text-[var(--text-secondary)] text-sm">
                    CyberCoin
                  </span>
                </div>

                <Button
                  className="cyber-btn mt-auto"
                  disabled={purchasing === rank.id}
                  onClick={() => handlePurchase(rank.id, rank.name)}
                >
                  {purchasing === rank.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sotib olinmoqda...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Sotib olish
                    </>
                  )}
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
