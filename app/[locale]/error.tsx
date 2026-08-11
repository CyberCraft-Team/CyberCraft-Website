"use client";

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
                        {/* Inline SVG for AlertTriangle */}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="40" 
                            height="40" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-[var(--secondary)]"
                        >
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                        Xatolik yuz berdi
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-2">
                        Kutilmagan xatolik yuz berdi. Iltimos, sahifani qayta yuklang yoki keyinroq urinib ko'ring.
                    </p>
                    <p className="text-xs text-red-500/80 font-mono bg-red-950/20 p-3 rounded-lg border border-red-500/20 mb-6 max-h-40 overflow-y-auto break-all">
                        {error?.message || String(error)}
                    </p>

                    <div className="space-y-3">
                        <Button onClick={reset} className="w-full cyber-btn flex items-center justify-center">
                            {/* Inline SVG for RefreshCw */}
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="mr-2"
                            >
                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                                <path d="M16 16h5v5"/>
                            </svg>
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
