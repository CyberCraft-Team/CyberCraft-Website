"use client";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";

/**
 * Global Google One Tap provider.
 * Bu component faqat layout.tsx da bir marta render qilinadi.
 * Shu sababli useGoogleOneTapLogin → google.accounts.id.initialize()
 * faqat BITTA marta chaqiriladi — "called multiple times" xatosi yo'qoladi.
 *
 * use_fedcm_for_prompt: false — One Tap FedCM ishlatmaydi (iframe orqali).
 * Bu GoogleLogin button bilan FedCM konfliktini oldini oladi.
 */
export default function GoogleOneTapProvider() {
  const { googleLogin, isAuthenticated } = useAuth();

  useGoogleOneTapLogin({
    onSuccess: async (response) => {
      if (!response.credential) return;
      try {
        await googleLogin(response.credential);
        window.location.href = "/";
      } catch {
        // Xatolik — foydalanuvchi login/register sahifasida ko'radi
      }
    },
    onError: () => {
      // One Tap ko'rsatilmadi (dismiss, browser block) — silent
    },
    // FedCM o'chiriladi — GoogleLogin button bilan konflikt bo'lmasin
    use_fedcm_for_prompt: false,
    cancel_on_tap_outside: false,
    // Foydalanuvchi allaqachon kirgan bo'lsa One Tap ko'rsatma
    disabled: isAuthenticated,
  });

  return null;
}
