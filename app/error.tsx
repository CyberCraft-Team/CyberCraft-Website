"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-dark)]">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--secondary)]/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative text-center max-w-md">
                <div className="cyber-card p-8">
                    <div className="w-20 h-20 rounded-full bg-[var(--secondary)]/20 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-[var(--secondary)]" />
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                        Xatolik yuz berdi
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Kutilmagan xatolik yuz berdi. Iltimos, sahifani qayta yuklang yoki keyinroq urinib ko'ring.
                    </p>

                    <div className="space-y-3">
                        <Button onClick={reset} className="w-full cyber-btn">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Qayta urinish
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent"
                            onClick={() => (window.location.href = "/")}
                        >
                            Bosh sahifaga qaytish
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
