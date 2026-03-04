"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CabinetError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)]/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-[var(--secondary)]" />
                </div>

                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Xatolik yuz berdi
                </h2>
                <p className="text-[var(--text-secondary)] mb-6 text-sm">
                    Sahifa yuklanishida xatolik. Qayta urinib ko'ring.
                </p>

                <div className="flex gap-3 justify-center">
                    <Button onClick={reset} className="cyber-btn">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Qayta urinish
                    </Button>
                    <Link href="/cabinet/profile">
                        <Button
                            variant="outline"
                            className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Profilga qaytish
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
