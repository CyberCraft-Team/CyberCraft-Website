"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserToken } from "@/lib/api/hooks";
import apiClient from "@/lib/api/client";
import type { Notification } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
    Bell,
    Check,
    CheckCheck,
    Info,
    Gift,
    AlertTriangle,
    Settings,
    Loader2,
    Trash2,
} from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
    info: Info,
    success: Check,
    warning: AlertTriangle,
    reward: Gift,
    system: Settings,
};

const typeColors: Record<string, string> = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    reward: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30",
    system: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const typeLabels: Record<string, string> = {
    info: "Ma'lumot",
    success: "Muvaffaqiyat",
    warning: "Ogohlantirish",
    reward: "Mukofot",
    system: "Tizim",
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "hozirgina";
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`;

    return date.toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function NotificationsPage() {
    const { isLoading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const fetchNotifications = useCallback(async () => {
        const token = getUserToken();
        if (!token) return;
        setLoading(true);
        try {
            const data = await apiClient.getNotifications(token);
            setNotifications(data);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkRead = async (id: number) => {
        const token = getUserToken();
        if (!token) return;
        try {
            await apiClient.markNotificationRead(token, id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch { }
    };

    const handleMarkAllRead = async () => {
        const token = getUserToken();
        if (!token) return;
        try {
            await apiClient.markAllNotificationsRead(token);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch { }
    };

    const filtered =
        filter === "unread"
            ? notifications.filter((n) => !n.is_read)
            : notifications;

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <Bell className="w-8 h-8 text-[var(--primary)]" />
                        Bildirishnomalar
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        {unreadCount > 0
                            ? `${unreadCount} ta o'qilmagan xabar`
                            : "Barcha xabarlar o'qilgan"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${filter === "all"
                                    ? "bg-[var(--primary)] text-[var(--bg-dark)]"
                                    : "bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            Barchasi ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${filter === "unread"
                                    ? "bg-[var(--primary)] text-[var(--bg-dark)]"
                                    : "bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            O'qilmagan ({unreadCount})
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--bg-dark)] bg-transparent"
                            onClick={handleMarkAllRead}
                        >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Barchasini o'qish
                        </Button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {filtered.length === 0 ? (
                <div className="cyber-card p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-30" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        {filter === "unread"
                            ? "O'qilmagan xabarlar yo'q"
                            : "Bildirishnomalar yo'q"}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Yangi bildirishnomalar bu yerda ko'rinadi
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((notif) => {
                        const Icon = typeIcons[notif.notification_type] || Info;
                        const colors =
                            typeColors[notif.notification_type] || typeColors.info;
                        const label =
                            typeLabels[notif.notification_type] || notif.notification_type;

                        return (
                            <div
                                key={notif.id}
                                className={`cyber-card p-4 sm:p-5 transition-all duration-200 hover:border-[var(--primary)]/30 ${!notif.is_read
                                        ? "border-l-4 border-l-[var(--primary)] bg-[var(--primary)]/5"
                                        : "opacity-75"
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div
                                        className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${colors}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-[var(--text-primary)]">
                                                    {notif.title}
                                                </h3>
                                                <span
                                                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${colors}`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!notif.is_read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                                                        onClick={() => handleMarkRead(notif.id)}
                                                    >
                                                        <Check className="w-3.5 h-3.5 mr-1" />
                                                        O'qish
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)]/60 mt-2">
                                            {formatDate(notif.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
