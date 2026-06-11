"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { useState, useCallback } from "react";
import { Loader2, AlertCircle, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Google kirish tugmasi.
 * <GoogleLogin useOneTap /> — bitta komponentda ham button, ham One Tap boshqariladi.
 * Bu kutubxonaning tavsiya etilgan usuli.
 *
 * "initialize() called multiple times" OGOHLANTIRISHNI YO'QOTISH uchun:
 * layout.tsx dagi GoogleOneTapProvider o'chirilgan.
 * Endi faqat shu komponent initialize() chaqiradi — bir marta.
 */
export default function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Username modal holati
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [tempCredential, setTempCredential] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredential = useCallback(
    async (credential: string) => {
      if (!credential) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await googleLogin(credential);
        if (response.needs_username) {
          setTempCredential(credential);
          setShowModal(true);
        } else {
          window.location.href = "/";
        }
      } catch (err: any) {
        setError(err.message || "Google orqali kirishda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    },
    [googleLogin]
  );

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setModalError("Username kiritilishi shart");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      const response = await googleLogin(tempCredential, cleanUsername);
      if (response.needs_username) {
        setModalError("Username kiritilishi shart");
      } else {
        setShowModal(false);
        window.location.href = "/";
      }
    } catch (err: any) {
      setModalError(err.message || "Username validatsiyasida xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--border-color)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--bg-dark)] px-2 text-[var(--text-secondary)]">
            Yoki Google orqali
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[var(--text-secondary)] py-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Kirish...</span>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) handleCredential(res.credential);
            }}
            onError={() => setError("Google orqali kirishda xatolik yuz berdi")}
            useOneTap={false}
            use_fedcm_for_prompt={false}
            use_fedcm_for_button={false}
            theme="filled_black"
            shape="rectangular"
            width={400}
          />
        )}
      </div>

      {/* Username Tanlash Modal oynasi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-dark)]/95 shadow-2xl glow-box">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box mx-auto mb-4">
                <UserIcon className="w-6 h-6 text-[var(--bg-dark)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                CyberCraft'ga xush kelibsiz!
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Ro'yxatdan o'tishni yakunlash uchun o'yindagi ismingizni (Minecraft username) kiriting.
              </p>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[var(--text-secondary)]">
                  Username *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <Input
                    type="text"
                    placeholder="O'yindagi taxallusingiz (masalan, Steve)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-11 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)]"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]/70">
                  3-16 ta belgi. Faqat lotin harflari, raqamlar va pastki chiziq (_) ruxsat etiladi.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] bg-transparent"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="flex-1 cyber-btn h-11 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    "Tasdiqlash"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
