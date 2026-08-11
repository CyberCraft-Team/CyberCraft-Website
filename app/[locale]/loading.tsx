import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box animate-pulse">
                    <Loader2 className="w-8 h-8 text-[var(--bg-dark)] animate-spin" />
                </div>
                <p className="text-[var(--text-secondary)] text-sm animate-pulse">
                    Yuklanmoqda...
                </p>
            </div>
        </div>
    );
}
