"use client";

import { useAuth } from "@/lib/auth-context";
import { getUserToken } from "@/lib/api/hooks";
import apiClient from "@/lib/api/client";
import {
  Loader2,
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  AlertCircle,
  CheckCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function EmailVerificationSection() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSendVerification = async () => {
    setSending(true);
    setResult(null);
    try {
      const token = getUserToken();
      if (!token) throw new Error("Token topilmadi");
      const data = await apiClient.sendVerificationEmail(token);
      setResult({ type: "success", message: data.message });
    } catch (err: any) {
      setResult({ type: "error", message: err.message });
    } finally {
      setSending(false);
    }
  };

  const hasEmail = !!user?.email;
  const isEmailVerified = !!user?.is_email_verified;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
          isEmailVerified 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : "bg-blue-500/10 border-blue-500/30"
        }`}>
          <Mail className={`w-5 h-5 ${isEmailVerified ? "text-emerald-400" : "text-blue-400"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {user?.email || "Email kiritilmagan"}
          </p>
          {isEmailVerified ? (
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Email manzilingiz tasdiqlangan
            </p>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Email manzilingizni tasdiqlang
            </p>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${result.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-500"
            }`}
        >
          {result.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {result.message}
        </div>
      )}

      {hasEmail && !isEmailVerified && (
        <Button
          onClick={handleSendVerification}
          disabled={sending}
          variant="outline"
          className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--bg-dark)] bg-transparent"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yuborilmoqda...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Tasdiqlash xabarini yuborish
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResult({ type: "error", message: "Parollar mos kelmaydi" });
      return;
    }
    if (newPassword.length < 6) {
      setResult({
        type: "error",
        message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
      });
      return;
    }

    setIsChanging(true);
    setResult(null);
    try {
      const token = getUserToken();
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/auth/launcher/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Parolni o'zgartirishda xatolik");
      }

      setResult({
        type: "success",
        message: "Parol muvaffaqiyatli o'zgartirildi!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setResult({ type: "error", message: err.message });
    } finally {
      setIsChanging(false);
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
          Sozlamalar
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Hisob sozlamalari va xavfsizlik
        </p>
      </div>

      {/* Account info */}
      <div className="cyber-card p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Hisob ma'lumotlari
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Username</p>
              <p className="text-[var(--text-primary)] font-medium">
                {user?.username || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <Mail className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Email</p>
              <p className="text-[var(--text-primary)] font-medium">
                {user?.email || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Rank</p>
              <p className="text-[var(--text-primary)] font-medium">
                {user?.rank || "Standart"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">
                Referral kod
              </p>
              <p className="text-[var(--text-primary)] font-mono text-sm">
                {user?.referral_code || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification */}
      <div className="cyber-card p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          <Mail className="w-5 h-5 inline mr-2" />
          Email tasdiqlash
        </h2>
        <EmailVerificationSection />
      </div>

      {/* Change password */}
      <div className="cyber-card p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          <Lock className="w-5 h-5 inline mr-2" />
          Parolni o'zgartirish
        </h2>

        {result && (
          <div
            className={`flex items-center gap-2 p-4 mb-4 rounded-lg ${result.type === "success"
              ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]"
              : "bg-red-500/10 border border-red-500/30 text-red-500"
              }`}
          >
            {result.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-secondary)]">
              Joriy parol
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Joriy parolingiz"
              className="h-11 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-secondary)]">
              Yangi parol
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yangi parol (kamida 6 ta belgi)"
              className="h-11 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-secondary)]">
              Parolni tasdiqlang
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yangi parolni qayta kiriting"
              className="h-11 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
              required
            />
          </div>
          <Button
            type="submit"
            className="cyber-btn"
            disabled={isChanging}
          >
            {isChanging ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                O'zgartirilmoqda...
              </>
            ) : (
              "Parolni o'zgartirish"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
