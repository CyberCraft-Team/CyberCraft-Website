import { Loader2 } from "lucide-react";

export default function CabinetLoading() {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                <p className="text-[var(--text-secondary)] text-sm">
                    Yuklanmoqda...
                </p>
            </div>
        </div>
    );
}
