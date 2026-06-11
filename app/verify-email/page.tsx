"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, Loader2, ArrowLeft, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api/client";
import { Suspense } from "react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [statusState, setStatusState] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Email manzilingiz tekshirilmoqda...");
    const verificationStarted = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatusState("error");
            setMessage("Tasdiqlash tokeni topilmadi. Havola noto'g'ri yoki eskirgan.");
            return;
        }

        if (verificationStarted.current) return;
        verificationStarted.current = true;

        const verify = async () => {
            try {
                const response = await apiClient.verifyEmail(token);
                setStatusState("success");
                setMessage(response.message || "Emailingiz muvaffaqiyatli tasdiqlandi!");
            } catch (err: any) {
                setStatusState("error");
                setMessage(err.message || "Emailni tasdiqlashda xatolik yuz berdi. Kod eskirgan bo'lishi mumkin.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="cyber-card p-8">
            {statusState === "loading" && (
                <div className="text-center space-y-4 py-6">
                    <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Emailingiz tasdiqlanmoqda
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Iltimos kuting, xavfsiz tasdiqlash jarayoni ketmoqda...
                    </p>
                </div>
            )}

            {statusState === "success" && (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Email muvaffaqiyatli tasdiqlandi!
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm px-4">
                        {message} Endi o'yin launcherida va shaxsiy kabinetda barcha imkoniyatlardan foydalanishingiz mumkin.
                    </p>
                    <div className="pt-4 space-y-3">
                        <Link href="/cabinet/settings">
                            <Button className="cyber-btn w-full">
                                Shaxsiy kabinetga o'tish
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" className="w-full border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent">
                                Kirish sahifasi
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {statusState === "error" && (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Tasdiqlash amalga oshmadi
                    </h2>
                    <p className="text-red-400/90 text-sm px-4 bg-red-950/20 py-3 rounded-lg border border-red-500/10 font-mono">
                        {message}
                    </p>
                    <p className="text-[var(--text-secondary)] text-xs">
                        Yangi tasdiqlash havolasini olish uchun shaxsiy kabinetingizga kiring.
                    </p>
                    <div className="pt-4 space-y-3">
                        <Link href="/cabinet/settings">
                            <Button className="cyber-btn w-full">
                                Sozlamalarga qaytish
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" className="w-full border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent">
                                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                Kirish sahifasiga qaytish
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--primary-dark)]/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box">
                            <Gamepad2 className="w-7 h-7 text-[var(--bg-dark)]" />
                        </div>
                        <span className="text-2xl font-bold">
                            <span className="text-[var(--primary)] neon-cyan">CYBER</span>
                            <span className="text-[var(--text-primary)]">CRAFT</span>
                        </span>
                    </Link>
                </div>

                <Suspense fallback={
                    <div className="cyber-card p-8 text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
                        <p className="text-sm text-[var(--text-secondary)]">Yuklanmoqda...</p>
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
