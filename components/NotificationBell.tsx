"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, X, Info, Gift, AlertTriangle, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getUserToken } from "@/lib/api/hooks";
import apiClient from "@/lib/api/client";
import type { Notification } from "@/lib/api/types";

const typeIcons: Record<string, React.ElementType> = {
    info: Info,
    success: Check,
    warning: AlertTriangle,
    reward: Gift,
    system: Settings,
};

const typeColors: Record<string, string> = {
    info: "text-blue-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
    reward: "text-[var(--primary)]",
    system: "text-purple-400",
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "hozirgina";
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`;
    return date.toLocaleDateString("uz-UZ");
}

export function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUnreadCount = useCallback(async () => {
        const token = getUserToken();
        if (!token) return;
        try {
            const data = await apiClient.getNotificationUnreadCount(token);
            setUnreadCount(data.unread_count);
        } catch { }
    }, []);

    const fetchNotifications = useCallback(async () => {
        const token = getUserToken();
        if (!token) return;
        setLoading(true);
        try {
            const data = await apiClient.getNotifications(token);
            setNotifications(data);
        } catch { } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchUnreadCount]);

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    const handleMarkRead = async (id: number) => {
        const token = getUserToken();
        if (!token) return;
        try {
            await apiClient.markNotificationRead(token, id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    const handleMarkAllRead = async () => {
        const token = getUserToken();
        if (!token) return;
        try {
            await apiClient.markAllNotificationsRead(token);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { }
    };

    if (!isAuthenticated) return null;

    return (
        <div ref={dropdownRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl shadow-black/50 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-dark)]">
                        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <Bell className="w-4 h-4 text-[var(--primary)]" />
                            Bildirishnomalar
                        </h3>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 h-7 px-2"
                                    onClick={handleMarkAllRead}
                                >
                                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                                    Barchasini o'qish
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Bildirishnomalar yo'q</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const Icon = typeIcons[notif.notification_type] || Info;
                                const color = typeColors[notif.notification_type] || "text-blue-400";
                                return (
                                    <div
                                        key={notif.id}
                                        className={`flex gap-3 px-4 py-3 border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-dark)] transition-colors cursor-pointer ${!notif.is_read ? "bg-[var(--primary)]/5" : ""
                                            }`}
                                        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${!notif.is_read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-secondary)]/60 mt-1">
                                                {timeAgo(notif.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
