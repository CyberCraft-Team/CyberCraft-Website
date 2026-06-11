"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Hash,
  Gamepad2,
  Coins,
  Crown,
  Ban,
  CheckCircle,
  XCircle,
  Link2,
  Clock,
  AlertTriangle,
  Unlock,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminToken } from "@/lib/api/hooks";
import { useAdminAuthContext } from "@/lib/admin-auth-context";
import type { User } from "@/lib/api/types";

interface ActionResult {
  type: "success" | "error";
  message: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const { user: adminUser } = useAdminAuthContext();
  const isSuperuser = adminUser?.is_superuser ?? false;

  const [banModal, setBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchUser = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${apiUrl}/admin/users/${userId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Foydalanuvchi topilmadi");
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const showResult = (type: "success" | "error", message: string) => {
    setResult({ type, message });
    setTimeout(() => setResult(null), 3500);
  };

  /** Universal action helper — endpoint ga POST yuboradi */
  const doAction = async (endpoint: string, body: object, key: string) => {
    setActionLoading(key);
    try {
      const token = getAdminToken();
      const res = await fetch(`${apiUrl}/admin/users/${userId}/${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      showResult("success", data.message || "Saqlandi");
      await fetchUser();
    } catch (err: any) {
      showResult("error", err.message || "Xatolik yuz berdi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async () => {
    await doAction("ban", { action: "ban", reason: banReason || "Admin tomonidan ban qilindi" }, "ban");
    setBanModal(false);
    setBanReason("");
  };

  const handleUnban = () => doAction("ban", { action: "unban" }, "ban");
  const toggleWhitelist = () => doAction("whitelist", { is_whitelisted: !user!.is_whitelisted }, "is_whitelisted");
  const toggleOperator = () => doAction("operator", { is_operator: !user!.is_operator }, "is_operator");
  const toggleStaff = () => doAction("staff", { is_staff: !user!.is_staff }, "is_staff");
  const toggleSuperuser = () => doAction("superuser", { is_superuser: !user!.is_superuser }, "is_superuser");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Button>
        <Card className="cyber-card border-[var(--border-color)] p-8 text-center">
          <p className="text-[var(--text-secondary)]">{error || "Foydalanuvchi topilmadi"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Feedback toast */}
      {result && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all
            ${result.type === "success"
              ? "bg-green-500/20 border border-green-500/40 text-green-300"
              : "bg-red-500/20 border border-red-500/40 text-red-300"
            }`}
        >
          {result.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {result.message}
        </div>
      )}

      {/* Ban modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              <Ban className="w-5 h-5 inline-block mr-2 text-red-400" />
              {user.username} ni ban qilish
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Ban qilingach foydalanuvchi tizimga kira olmaydi.
            </p>
            <textarea
              placeholder="Ban sababi (ixtiyoriy)..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
              className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] resize-none mb-4 focus:outline-none focus:border-red-500/50"
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => { setBanModal(false); setBanReason(""); }}
              >
                Bekor qilish
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleBan}
                disabled={actionLoading === "ban"}
              >
                {actionLoading === "ban" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Ban className="w-4 h-4 mr-1.5" /> Ban qilish</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" /> Foydalanuvchilarga qaytish
        </Button>

        <div className="flex items-center justify-between gap-5 flex-wrap">
          <div className="flex items-center gap-5">
            {user.skin_face_url ? (
              <img
                src={user.skin_face_url}
                alt={user.username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--border-color)]"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-2xl font-bold text-[var(--bg-dark)]">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">{user.username}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {user.is_staff && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/20 text-[var(--primary)]">
                    Staff
                  </span>
                )}
                {user.is_superuser && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    Superuser
                  </span>
                )}
                {user.is_banned && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    🚫 Banlangan
                  </span>
                )}
                {user.is_email_verified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    ✓ Email tasdiqlangan
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    Email tasdiqlanmagan
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--secondary)]/20 text-[var(--secondary)]">
                  {user.rank}
                </span>
              </div>
            </div>
          </div>

          {/* Ban / Unban tugmasi */}
          {user.is_banned ? (
            <Button
              onClick={handleUnban}
              disabled={actionLoading === "ban"}
              className="gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/30"
              variant="ghost"
            >
              {actionLoading === "ban" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Unlock className="w-4 h-4" /> Ban dan chiqarish</>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setBanModal(true)}
              disabled={actionLoading === "ban"}
              className="gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30"
              variant="ghost"
            >
              <Ban className="w-4 h-4" /> Ban qilish
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asosiy ma'lumotlar */}
        <Card className="cyber-card border-[var(--border-color)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Asosiy ma'lumotlar</h2>
          <div className="space-y-4">
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
            <InfoRow icon={<Hash className="w-4 h-4" />} label="ID" value={`#${user.id}`} />
            <InfoRow icon={<Gamepad2 className="w-4 h-4" />} label="Minecraft UUID" value={user.minecraft_uuid || "—"} mono />
            <InfoRow icon={<Link2 className="w-4 h-4" />} label="Referral Code" value={user.referral_code || "—"} mono />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Ro'yxatdan o'tgan" value={formatDate(user.created_at)} />
            <InfoRow icon={<Clock className="w-4 h-4" />} label="Oxirgi kirish" value={formatDate(user.last_login)} />
          </div>
        </Card>

        {/* Balans va Rank */}
        <Card className="cyber-card border-[var(--border-color)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Balans va Rank</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-dark)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">CC Balans</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {user.cc_balance?.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-dark)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--secondary)]/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[var(--secondary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Rank</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{user.rank}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Ruxsatlar */}
        <Card className="cyber-card border-[var(--border-color)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Ruxsatlar</h2>
          <div className="space-y-3">
            <PermissionRow
              icon={<UserCheck className="w-4 h-4" />}
              label="Whitelist"
              description="Minecraft serverga kirish ruxsati"
              value={user.is_whitelisted}
              loading={actionLoading === "is_whitelisted"}
              onToggle={toggleWhitelist}
            />
            <PermissionRow
              icon={<ShieldCheck className="w-4 h-4" />}
              label="Operator"
              description="Minecraft server operator"
              value={user.is_operator}
              loading={actionLoading === "is_operator"}
              onToggle={toggleOperator}
            />
            <PermissionRow
              icon={<Shield className="w-4 h-4" />}
              label="Staff (Admin panel)"
              description="Admin panelga kirish huquqi"
              value={user.is_staff}
              loading={actionLoading === "is_staff"}
              onToggle={toggleStaff}
            />
            <PermissionRow
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Superuser"
              description={isSuperuser ? "Barcha huquqlar" : "Barcha huquqlar (faqat ko'rish)"}
              value={user.is_superuser}
              loading={actionLoading === "is_superuser"}
              onToggle={isSuperuser ? toggleSuperuser : undefined}
              disabled={!isSuperuser}
            />
          </div>
        </Card>

        {/* Ban holati */}
        <Card className="cyber-card border-[var(--border-color)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Ban holati</h2>
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between p-4 rounded-xl ${
                user.is_banned
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-green-500/10 border border-green-500/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {user.is_banned ? (
                  <Ban className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    {user.is_banned ? "Banlangan" : "Faol"}
                  </p>
                  {user.is_banned && user.ban_reason && (
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      Sabab: {user.ban_reason}
                    </p>
                  )}
                </div>
              </div>
              {user.is_banned ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUnban}
                  disabled={actionLoading === "ban"}
                  className="text-green-400 hover:text-green-300 text-xs"
                >
                  {actionLoading === "ban" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Chiqarish"}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBanModal(true)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Ban
                </Button>
              )}
            </div>
            {user.banned_until && (
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Ban tugash vaqti"
                value={formatDate(user.banned_until)}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm text-[var(--text-primary)] ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function PermissionRow({
  icon,
  label,
  description,
  value,
  loading,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  loading?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-dark)]">
      <div className="flex items-center gap-2.5">
        <span className={value ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}>{icon}</span>
        <div>
          <span className="text-sm text-[var(--text-primary)]">{label}</span>
          {description && (
            <p className="text-xs text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <XCircle className="w-4 h-4 text-[var(--text-secondary)]" />
        )}
        {!disabled && onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            disabled={loading}
            className={`text-xs h-7 px-2.5 ${
              value
                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
            }`}
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : value ? (
              "O'chirish"
            ) : (
              "Yoqish"
            )}
          </Button>
        )}
        {disabled && (
          <span className="text-xs text-[var(--text-secondary)] px-2">Faqat ko'rish</span>
        )}
      </div>
    </div>
  );
}
