"use client";

import { useCCTransactions } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function BalancePage() {
  const { user } = useAuth();
  const { transactions, isLoading } = useCCTransactions();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Balans
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          CyberCoin balansingiz va statistikasi
        </p>
      </div>

      {/* Balance card */}
      <div className="cyber-card p-8 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-dark)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--warning)] to-[var(--secondary)] flex items-center justify-center">
            <Wallet className="w-8 h-8 text-[var(--bg-dark)]" />
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm">
              Joriy balans
            </p>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-[var(--warning)]" />
              <span className="text-4xl font-bold text-[var(--text-primary)]">
                {user?.cc_balance ?? 0}
              </span>
              <span className="text-[var(--text-secondary)]">CC</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-[var(--accent)] mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Jami kirim</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              +{totalEarned}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-[var(--secondary)] mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Jami chiqim</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              -{totalSpent}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Tranzaksiyalar</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {transactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            So'nggi tranzaksiyalar
          </h2>
          <Link
            href="/cabinet/transactions"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Hammasi →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8">
            Hali tranzaksiyalar yo'q
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)] hover:bg-[var(--primary)]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0
                        ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "bg-[var(--secondary)]/20 text-[var(--secondary)]"
                      }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {tx.transaction_type_display}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {tx.description}
                    </p>
                  </div>
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
        )}
      </div>
    </div>
  );
}
