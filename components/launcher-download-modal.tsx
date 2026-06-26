"use client";

import { useEffect, useState, useRef } from "react";
import {
  X,
  Download,
  Monitor,
  Apple,
  Terminal,
  Loader2,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { useLauncherDownloads } from "@/lib/api/hooks";

interface LauncherDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LauncherDownloadModal({
  isOpen,
  onClose,
}: LauncherDownloadModalProps) {
  const { downloads, isLoading, isError } = useLauncherDownloads();
  const [detectedOS, setDetectedOS] = useState<"win32" | "darwin" | "linux">("win32");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) {
        setDetectedOS("win32");
      } else if (ua.includes("mac")) {
        setDetectedOS("darwin");
      } else if (ua.includes("linux")) {
        setDetectedOS("linux");
      }
    }
  }, []);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "— MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const platforms = [
    {
      key: "win32" as const,
      name: "Windows",
      icon: Monitor,
      color: "from-[#00c6ff] to-[#0072ff]",
      shadowColor: "rgba(0, 198, 255, 0.2)",
      extension: ".exe",
      installGuide: "Yuklab olingan .exe faylini ishga tushiring va o'rnatish ko'rsatmalariga rioya qiling.",
    },
    {
      key: "darwin" as const,
      name: "macOS",
      icon: Apple,
      color: "from-[#e2e2e2] to-[#8e9eab]",
      shadowColor: "rgba(226, 226, 226, 0.15)",
      extension: ".dmg",
      installGuide: ".dmg faylini oching va CyberCraft ilovasini 'Applications' papkasiga o'tkazing.",
    },
    {
      key: "linux" as const,
      name: "Linux",
      icon: Terminal,
      color: "from-[#f12711] to-[#f5af19]",
      shadowColor: "rgba(241, 39, 17, 0.2)",
      extension: ".tar.gz",
      installGuide: "Faylni oching va ./cybercraft-launcher buyrug'i orqali ishga tushiring.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl glass rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Decorative corner lights */}
        <div className="absolute top-0 left-0 w-16 h-[2px] bg-gradient-to-r from-[var(--primary)] to-transparent" />
        <div className="absolute top-0 left-0 w-[2px] h-16 bg-gradient-to-b from-[var(--primary)] to-transparent" />
        <div className="absolute bottom-0 right-0 w-16 h-[2px] bg-gradient-to-l from-[var(--secondary)] to-transparent" />
        <div className="absolute bottom-0 right-0 w-[2px] h-16 bg-gradient-to-t from-[var(--secondary)] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30">
              <Download className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-wide text-white">
                LAUNCHERNI YUKLAB OLISH
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                CyberCraft olamiga kirish uchun rasmiy launcherni o'rnating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
              <p className="text-sm text-[var(--text-secondary)]">Havolalar yuklanmoqda...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                <Info className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Tizimga ulanishda xatolik</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                Yuklab olish havolalarini olishda muammo yuz berdi. Iltimos, keyinroq qayta urunib ko'ring.
              </p>
            </div>
          ) : (
            <>
              {/* Platforms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platforms.map((platform) => {
                  const release = downloads?.[platform.key];
                  const isRecommended = detectedOS === platform.key;
                  const PlatformIcon = platform.icon;

                  return (
                    <div
                      key={platform.key}
                      className={`relative flex flex-col justify-between p-6 rounded-xl transition-all duration-300 border ${
                        isRecommended
                          ? "bg-[var(--bg-card)] border-[var(--primary)]/60 shadow-[0_0_25px_rgba(0,240,255,0.15)] animate-pulse-glow"
                          : "bg-[var(--bg-card)]/50 border-[var(--border-color)] hover:border-[var(--text-secondary)]/30"
                      }`}
                    >
                      {/* Recommended Badge */}
                      {isRecommended && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-black tracking-widest bg-[var(--primary)] text-[var(--bg-dark)] rounded-full shadow-lg">
                          TAFSIYA ETILADI
                        </span>
                      )}

                      <div>
                        {/* Platform Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`} style={{ boxShadow: `0 8px 20px ${platform.shadowColor}` }}>
                            <PlatformIcon className="w-6 h-6 text-white" />
                          </div>
                          {release ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                              v{release.version}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)]">
                              Tez kunda
                            </span>
                          )}
                        </div>

                        {/* Title & Stats */}
                        <h3 className="text-lg font-black text-white mb-2">{platform.name}</h3>
                        {release ? (
                          <div className="space-y-1 mb-6 text-xs text-[var(--text-secondary)]">
                            <p>Fayl hajmi: <span className="text-white font-medium">{formatSize(release.file_size)}</span></p>
                            <p>Formati: <span className="text-white font-medium">{platform.extension}</span></p>
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-secondary)] mb-6">
                            Ushbu platforma uchun launcher hozirda ishlab chiqilmoqda.
                          </p>
                        )}
                      </div>

                      {/* Download Button */}
                      {release ? (
                        <a
                          href={release.download_url}
                          download
                          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                            isRecommended
                              ? "bg-[var(--primary)] text-[var(--bg-dark)] hover:shadow-[0_0_20px_var(--primary)] font-extrabold"
                              : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          YUKLAB OLISH
                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white/5 border border-white/5 text-[var(--text-secondary)]/50 text-sm cursor-not-allowed"
                        >
                          Mavjud emas
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Install and Security Notice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
                {/* Security Box */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Xavfsiz va Ishonchli</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Barcha launcher fayllari viruslarga qarshi tekshirilgan va raqamli imzolangan. Xavfsiz yuklab olishingiz mumkin.
                    </p>
                  </div>
                </div>

                {/* Performance Box */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Avtomatik yangilanish</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Launcher ishga tushganda yangi modlar, modpacklar va launcher yangilanishlarini o'zi avtomatik yuklab oladi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Collapsible guides or lists */}
              <div className="bg-black/30 border border-[var(--border-color)] rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-3">Qanday o'rnatiladi?</h4>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)] list-disc pl-4">
                  <li>Kompyuteringizga mos keladigan launcherni yuklab oling.</li>
                  <li>Yuklab olingan faylni ishga tushiring va o'rnating.</li>
                  <li>Launcherga CyberCraft saytidan ro'yxatdan o'tgan akkountingiz orqali kiring.</li>
                  <li>Kerakli serverni tanlang va o'yinni boshlang. Barcha kerakli modlar va fayllar avtomatik yuklab olinadi!</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
