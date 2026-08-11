"use client";

import { useAuth } from "@/lib/auth-context";
import { useDailyBonusStatus, useReferralInfo, useCCTransactions } from "@/lib/api/hooks";
import {
  Loader2,
  BarChart3,
  Coins,
  Flame,
  Users,
  Gift,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function StatisticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { bonusStatus } = useDailyBonusStatus();
  const { referralInfo } = useReferralInfo();
  const { transactions } = useCCTransactions();

  const isLoading = authLoading;

  const totalEarned = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const stats = [
    {
      icon: Coins,
      label: "Joriy balans",
      value: `${user?.cc_balance ?? 0} CC`,
      color: "var(--warning)",
    },
    {
      icon: TrendingUp,
      label: "Jami kirim",
      value: `+${totalEarned} CC`,
      color: "var(--accent)",
    },
    {
      icon: BarChart3,
      label: "Jami chiqim",
      value: `-${totalSpent} CC`,
      color: "var(--secondary)",
    },
    {
      icon: Clock,
      label: "Tranzaksiyalar soni",
      value: transactions.length.toString(),
      color: "var(--primary)",
    },
    {
      icon: Flame,
      label: "Bonus streak",
      value: `${bonusStatus?.streak ?? 0} kun`,
      color: "var(--warning)",
    },
    {
      icon: Users,
      label: "Taklif qilinganlar",
      value: `${referralInfo?.referral_count ?? 0} nafar`,
      color: "var(--accent)",
    },
    {
      icon: Gift,
      label: "Keyingi bonus",
      value: `${bonusStatus?.next_bonus ?? 0} CC`,
      color: "var(--primary)",
    },
    {
      icon: Users,
      label: "Taklif bonusi",
      value: `${referralInfo?.bonus_per_invite ?? 0} CC`,
      color: "var(--secondary)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Statistika
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          O'yin va hisob statistikangiz
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="cyber-card p-5 hover:border-[var(--primary)]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon
                  className="w-5 h-5"
                  style={{ color: stat.color }}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                {stat.label}
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      {transactions.length > 0 && (
        <div className="cyber-card p-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            So'nggi faollik
          </h2>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]"
              >
                <div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {tx.transaction_type_display}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(tx.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <span
                  className={`font-bold text-sm ${tx.amount > 0
                      ? "text-[var(--accent)]"
                      : "text-[var(--secondary)]"
                    }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount} CC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
