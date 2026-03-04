"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await apiClient.requestPasswordReset(email);
            setSent(true);
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--primary-dark)]/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
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

                <div className="cyber-card p-8">
                    {sent ? (
                        /* Success state */
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Xabar yuborildi!
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                Agar <strong className="text-[var(--text-primary)]">{email}</strong> ro'yxatda bo'lsa,
                                parol tiklash havolasi emailingizga yuborildi.
                                Spam papkasini ham tekshiring.
                            </p>
                            <Link href="/login">
                                <Button className="cyber-btn w-full mt-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kirish sahifasiga qaytish
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        /* Form */
                        <>
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                    Parolni tiklash
                                </h1>
                                <p className="text-[var(--text-secondary)] mt-2 text-sm">
                                    Email manzilingizni kiriting va biz parolni tiklash havolasini yuboramiz
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-secondary)]">
                                        Email manzil
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            className="h-11 pl-10 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full cyber-btn h-11"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Yuborilmoqda...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Tiklash havolasini yuborish
                                        </>
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
            </div>
        </div>
    );
}
