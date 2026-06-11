"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

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

  const handleCredential = useCallback(
    async (credential: string) => {
      if (!credential) return;
      setIsLoading(true);
      setError(null);
      try {
        await googleLogin(credential);
        window.location.href = "/";
      } catch (err: any) {
        setError(err.message || "Google orqali kirishda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    },
    [googleLogin]
  );

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
            useOneTap
            theme="filled_black"
            shape="rectangular"
            width={400}
          />
        )}
      </div>
    </div>
  );
}
