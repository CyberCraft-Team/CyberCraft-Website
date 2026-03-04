"use client";

import { useCCTransactions } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Receipt,
  Coins,
} from "lucide-react";

export default function TransactionsPage() {
  const { isAuthenticated } = useAuth();
  const { transactions, isLoading, isError } = useCCTransactions();

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
          Tranzaksiyalar
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          CyberCoin tranzaksiyalar tarixi
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Receipt className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Tranzaksiyalar yo'q
          </h2>
          <p className="text-[var(--text-secondary)]">
            Hali hech qanday CyberCoin tranzaksiya amalga oshirilmagan
          </p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] bg-[var(--bg-dark)]">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Turi</div>
            <div className="col-span-4">Tavsif</div>
            <div className="col-span-2">Miqdor</div>
            <div className="col-span-2">Sana</div>
          </div>

          {/* Rows */}
          {transactions.map((tx, index) => {
            const isPositive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--primary)]/5 transition-colors"
              >
                <div className="col-span-1 text-[var(--text-secondary)] text-sm">
                  {index + 1}
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive
                        ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "bg-[var(--secondary)]/20 text-[var(--secondary)]"
                      }`}
                  >
                    {isPositive ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[var(--text-primary)] text-sm font-medium">
                    {tx.transaction_type_display}
                  </span>
                </div>
                <div className="col-span-4 text-[var(--text-secondary)] text-sm truncate">
                  {tx.description}
                </div>
                <div className="col-span-2">
                  <span
                    className={`flex items-center gap-1 font-bold text-sm ${isPositive
                        ? "text-[var(--accent)]"
                        : "text-[var(--secondary)]"
                      }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {isPositive ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
                <div className="col-span-2 text-[var(--text-secondary)] text-xs">
                  {new Date(tx.created_at).toLocaleDateString("uz-UZ", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
