"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, Lock, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import { Suspense } from "react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Parollar mos kelmaydi");
            return;
        }
        if (newPassword.length < 6) {
            setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
            return;
        }
        if (!token) {
            setError("Token topilmadi. Havola noto'g'ri.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.confirmPasswordReset(token, newPassword);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cyber-card p-8">
            {success ? (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Parol muvaffaqiyatli o'zgartirildi!
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Yangi parolingiz bilan kiring
                    </p>
                    <Link href="/login">
                        <Button className="cyber-btn w-full mt-4">
                            Kirish sahifasiga o'tish
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                            Yangi parol o'rnatish
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-2 text-sm">
                            Yangi parol kiriting
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {!token && (
                        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Havola noto'g'ri yoki token topilmadi
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-secondary)]">
                                Yangi parol
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Kamida 6 ta belgi"
                                    className="h-11 pl-10 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-secondary)]">
                                Parolni tasdiqlang
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Parolni qayta kiriting"
                                    className="h-11 pl-10 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full cyber-btn h-11"
                            disabled={loading || !token}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    O'zgartirilmoqda...
                                </>
                            ) : (
                                "Parolni o'zgartirish"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3 inline mr-1" />
                            Kirish sahifasiga qaytish
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
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

                <Suspense fallback={<div className="cyber-card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
