"use client";

import { useDailyBonusStatus } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2,
  Gift,
  Calendar,
  Flame,
  CheckCircle,
  Clock,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BonusPage() {
  const { isAuthenticated } = useAuth();
  const { bonusStatus, isLoading, claimBonus, mutate } =
    useDailyBonusStatus();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimResult(null);
    try {
      const result = await claimBonus();
      setClaimResult(`${result.amount} CyberCoin olindi!`);
      mutate();
    } catch (err: any) {
      setClaimResult("Xatolik: " + (err.message || "Qayta urinib ko'ring"));
    } finally {
      setIsClaiming(false);
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
          Kunlik Bonus
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Har kuni kiring va bonus oling!
        </p>
      </div>

      {/* Streak card */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center">
            <Flame className="w-7 h-7 text-[var(--bg-dark)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {bonusStatus?.streak || 0} kun streak
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              Ketma-ket kirish kunlari
            </p>
          </div>
        </div>

        {/* Streak progress */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: 7 }).map((_, i) => {
            const isCompleted = i < (bonusStatus?.streak || 0) % 7;
            const isCurrent = i === (bonusStatus?.streak || 0) % 7;
            return (
              <div
                key={i}
                className={`relative rounded-xl p-3 text-center border transition-all ${isCompleted
                    ? "bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]"
                    : isCurrent
                      ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] animate-pulse"
                      : "bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-secondary)]"
                  }`}
              >
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-bold">
                  {i + 1}-kun
                </span>
                {isCompleted && (
                  <CheckCircle className="w-3.5 h-3.5 absolute -top-1 -right-1 text-[var(--primary)]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Claim section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-[var(--warning)]" />
            <div>
              <p className="text-[var(--text-primary)] font-bold">
                Keyingi bonus: {bonusStatus?.next_bonus || 0} CC
              </p>
              {bonusStatus?.last_claim && (
                <p className="text-[var(--text-secondary)] text-xs">
                  Oxirgi olish:{" "}
                  {new Date(bonusStatus.last_claim).toLocaleDateString(
                    "uz-UZ"
                  )}
                </p>
              )}
            </div>
          </div>

          <Button
            className="cyber-btn min-w-[160px]"
            disabled={!bonusStatus?.can_claim || isClaiming}
            onClick={handleClaim}
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Olinmoqda...
              </>
            ) : bonusStatus?.can_claim ? (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Bonusni olish
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Ertaga keling
              </>
            )}
          </Button>
        </div>

        {claimResult && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-center font-medium">
            {claimResult}
          </div>
        )}
      </div>
    </div>
  );
}
