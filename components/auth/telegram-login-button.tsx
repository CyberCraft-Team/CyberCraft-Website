"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    // Define the callback globally so the Telegram script can find it
    window.onTelegramAuth = async (user: TelegramUser) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await telegramLogin(user);
        const searchParams = new URLSearchParams(window.location.search);
        const callback = searchParams.get("callback");
        if (callback && (callback.startsWith("http://localhost:") || callback.startsWith("http://127.0.0.1:"))) {
          window.location.href = `${callback}?token=${response.token}&username=${response.user.username}`;
        } else if (window.location.pathname === "/admin-login") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/";
        }
      } catch (err: any) {
        console.error("Telegram login error:", err);
        setError(err.message || "Telegram orqali kirishda xatolik yuz berdi");
        setIsLoading(false);
      }
    };

    // Create and append the script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
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
      
      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}
    </div>
  );
}
