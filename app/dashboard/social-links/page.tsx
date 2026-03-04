"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Loader2,
    Trash2,
    Save,
    Youtube,
    Send,
    MessageCircle,
    Globe,
    Music,
    Instagram,
    Twitter,
    GripVertical,
    ExternalLink,
    Pencil,
    X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdminAuthContext } from "@/lib/admin-auth-context";
import apiClient from "@/lib/api/client";
import type { SocialLink } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";

const platformOptions = [
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "telegram", label: "Telegram", icon: Send },
    { value: "discord", label: "Discord", icon: MessageCircle },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "tiktok", label: "TikTok", icon: Music },
    { value: "twitter", label: "Twitter/X", icon: Twitter },
    { value: "other", label: "Boshqa", icon: Globe },
];

function getPlatformIcon(platform: string): LucideIcon {
    const found = platformOptions.find((p) => p.value === platform);
    return found?.icon || Globe;
}

const emptyLink: Omit<SocialLink, "id"> = {
    platform: "youtube",
    name: "",
    url: "",
    icon: "",
    color: "",
    is_active: true,
    order: 0,
};

export default function SocialLinksPage() {
    const { token } = useAdminAuthContext();
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<number | "new" | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<SocialLink, "id">>(emptyLink);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchLinks = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await apiClient.getAdminSocialLinks(token);
            setLinks(data);
        } catch (err) {
            setError("Social linklarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [token]);

    const handleSubmit = async () => {
        if (!token || !formData.name || !formData.url) {
            setError("Ism va URL to'ldirilishi shart");
            return;
        }

        setIsSaving(editingId ?? "new");
        setError(null);
        setSuccess(null);

        try {
            if (editingId !== null) {
                await apiClient.updateSocialLink(token, editingId, formData);
                setSuccess("Social link yangilandi!");
            } else {
                await apiClient.createSocialLink(token, formData);
                setSuccess("Social link qo'shildi!");
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(emptyLink);
            await fetchLinks();
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setIsSaving(null);
        }
    };

    const handleEdit = (link: SocialLink) => {
        setEditingId(link.id);
        setFormData({
            platform: link.platform,
            name: link.name,
            url: link.url,
            icon: link.icon,
            color: link.color,
            is_active: link.is_active,
            order: link.order,
        });
        setShowForm(true);
        setError(null);
        setSuccess(null);
    };

    const handleDelete = async (id: number) => {
        if (!token) return;
        if (!confirm("Bu social linkni o'chirishni xohlaysizmi?")) return;

        try {
            await apiClient.deleteSocialLink(token, id);
            setSuccess("Social link o'chirildi!");
            await fetchLinks();
        } catch (err: any) {
            setError(err.message || "O'chirishda xatolik");
        }
    };

    const handleToggleActive = async (link: SocialLink) => {
        if (!token) return;
        try {
            await apiClient.updateSocialLink(token, link.id, {
                is_active: !link.is_active,
            });
            await fetchLinks();
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyLink);
        setError(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        Social Linklar
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Ijtimoiy tarmoq havolalarini boshqarish
                    </p>
                </div>
                {!showForm && (
                    <Button
                        className="cyber-btn"
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData(emptyLink);
                            setError(null);
                            setSuccess(null);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Yangi link
                    </Button>
                )}
            </div>

            {/* Status messages */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-sm">
                    {success}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="cyber-card border-[var(--border-color)] mb-6">
                    <CardHeader>
                        <CardTitle className="text-[var(--text-primary)] flex items-center justify-between">
                            <span>{editingId ? "Social linkni tahrirlash" : "Yangi social link"}</span>
                            <Button variant="ghost" size="sm" onClick={cancelForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Platform */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-secondary)]">Platforma</Label>
                                <Select
                                    value={formData.platform}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            platform: value,
                                            name: formData.name || platformOptions.find((p) => p.value === value)?.label || "",
                                        })
                                    }
                                >
                                    <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {platformOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <opt.icon className="w-4 h-4" />
                                                    {opt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-secondary)]">Nom</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="YouTube kanal"
                                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                                />
                            </div>

                            {/* URL */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[var(--text-secondary)]">URL</Label>
                                <Input
                                    value={formData.url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, url: e.target.value })
                                    }
                                    placeholder="https://youtube.com/@cybercraft"
                                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                                />
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-secondary)]">
                                    Tartib raqami
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            order: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                                />
                            </div>

                            {/* Active */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-secondary)]">Holat</Label>
                                <div className="flex items-center gap-3 pt-2">
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, is_active: checked })
                                        }
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">
                                        {formData.is_active ? "Faol" : "Nofaol"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="cyber-btn"
                                onClick={handleSubmit}
                                disabled={isSaving !== null}
                            >
                                {isSaving !== null ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saqlanmoqda...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingId ? "Yangilash" : "Qo'shish"}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={cancelForm}
                                className="border-[var(--border-color)]"
                            >
                                Bekor qilish
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Links List */}
            {links.length === 0 ? (
                <Card className="cyber-card border-[var(--border-color)]">
                    <CardContent className="py-12 text-center">
                        <Globe className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                            Social linklar yo'q
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Yangi social link qo'shish uchun "Yangi link" tugmasini bosing
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {links.map((link) => {
                        const Icon = getPlatformIcon(link.platform);
                        return (
                            <Card
                                key={link.id}
                                className={`cyber-card border-[var(--border-color)] transition-all ${!link.is_active ? "opacity-50" : ""
                                    }`}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">
                                        {/* Order indicator */}
                                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                                            <GripVertical className="w-4 h-4" />
                                            <span className="text-xs font-mono w-6 text-center">
                                                {link.order}
                                            </span>
                                        </div>

                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-[var(--primary)]" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                    {link.name}
                                                </p>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-dark)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                    {platformOptions.find((p) => p.value === link.platform)?.label || link.platform}
                                                </span>
                                            </div>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1 truncate"
                                            >
                                                {link.url}
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                            </a>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Switch
                                                checked={link.is_active}
                                                onCheckedChange={() => handleToggleActive(link)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
                                                onClick={() => handleEdit(link)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[var(--text-secondary)] hover:text-red-500"
                                                onClick={() => handleDelete(link.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
