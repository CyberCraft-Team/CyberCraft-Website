"use client";

import { GoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

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

  // use_fedcm_for_prompt: false — One Tap popup FedCM ishlatmaydi (iframe orqali ishlaydi).
  // Shu parametrsiz useGoogleOneTapLogin VA <GoogleLogin> birgalikda ikkita
  // navigator.credentials.get() chaqiradi → "Only one request" FedCM xatosi chiqadi.
  useGoogleOneTapLogin({
    onSuccess: (response) => {
      if (response.credential) {
        handleCredential(response.credential);
      }
    },
    onError: () => {
      // One Tap dismiss yoki bloklangan bo'lsa — silent
    },
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: false,
  });

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    await handleCredential(credentialResponse.credential);
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
            onSuccess={handleSuccess}
            onError={() => setError("Google orqali kirishda xatolik yuz berdi")}
            // useOneTap OLIB TASHLANDI — yuqorida useGoogleOneTapLogin hook ishlatilmoqda.
            // Ikkalasi birga bo'lsa: initialize() ikki marta chaqiriladi → FedCM xatosi.
            theme="filled_black"
            shape="rectangular"
            // GSI faqat piksel qabul qiladi, "100%" yaroqsiz → button ko'rinmaydi
            width={400}
            // use_fedcm_for_button: false — button bosilganda FedCM ishlatmaydi.
            // FedCM "NetworkError: Error retrieving a token" xatosining oldini oladi.
            use_fedcm_for_button={false}
          />
        )}
      </div>
    </div>
  );
}
