"use client";
 
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
 
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
 
declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}
 
export default function TelegramLoginButton() {
  const { telegramLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIp, setIsIp] = useState(false);
  const [localUrl, setLocalUrl] = useState("#");

  // Username modal state
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [tempUser, setTempUser] = useState<TelegramUser | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTelegramAuth = async (user: TelegramUser, chosenUsername?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await telegramLogin(user, chosenUsername);
      if (response.needs_username) {
        setTempUser(user);
        setShowModal(true);
      } else {
        setShowModal(false);
        const searchParams = new URLSearchParams(window.location.search);
        const callback = searchParams.get("callback");
        if (callback && (callback.startsWith("http://localhost:") || callback.startsWith("http://127.0.0.1:"))) {
          window.location.href = `${callback}?token=${response.token}&username=${response.user.username}`;
        } else if (window.location.pathname === "/admin-login") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      console.error("Telegram login error:", err);
      if (showModal || tempUser) {
        setModalError(err.message || "Username validatsiyasida xatolik yuz berdi");
      } else {
        setError(err.message || "Telegram orqali kirishda xatolik yuz berdi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setModalError("Username kiritilishi shart");
      return;
    }
    if (!tempUser) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await handleTelegramAuth(tempUser, cleanUsername);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check if current hostname is an IP address (Telegram widget blocks IP addresses)
    const hostname = window.location.hostname;
    const isIpAddr = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    setIsIp(isIpAddr);
    
    if (isIpAddr) {
      setLocalUrl(`http://localhost:${window.location.port || "3000"}${window.location.pathname}${window.location.search}`);
    }

    // Define the callback globally so the Telegram script can find it
    window.onTelegramAuth = async (user: TelegramUser) => {
      await handleTelegramAuth(user);
    };

    // Create and append the script
    const script = document.createElement("script");
    // Add cache buster to force script evaluation in client routing/strict mode
    script.src = `https://telegram.org/js/telegram-widget.js?22&r=${Math.random()}`;
    script.setAttribute("data-telegram-login", process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "CyberCraftRobot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      (window as any).onTelegramAuth = undefined;
    };
  }, [telegramLogin]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative w-full flex items-center justify-center min-h-[40px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-dark)]/50 z-10 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
          </div>
        )}
        <div ref={containerRef} className={isLoading ? "opacity-50 pointer-events-none" : ""} />
      </div>
      
      {isIp && process.env.NODE_ENV === 'development' && (
        <div className="text-amber-500 text-xs text-center border border-amber-500/30 bg-amber-500/10 rounded-lg p-4 w-full max-w-sm mt-2">
          <p className="font-semibold mb-1 flex items-center justify-center gap-1">
            ⚠️ Telegram Login ishlamasligi mumkin
          </p>
          <p className="text-[11px] leading-relaxed text-amber-500/80">
            Telegram widget IP-manzilda (127.0.0.1) ishlamaydi. Buni to'g'irlash uchun saytga <strong>localhost:3000</strong> orqali kiring.
          </p>
          <a href={localUrl} className="inline-block mt-2.5 px-4 py-1.5 bg-amber-500 text-black font-semibold rounded text-[11px] hover:bg-amber-400 transition-colors">
            localhost ga o'tish
          </a>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}

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
