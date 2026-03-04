"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "CyberCraft",
    site_description: "Eng yaxshi Minecraft serverlari platformasi",
    discord_url: "https://discord.gg/cybercraft",
    telegram_url: "https://t.me/cybercraft",
    maintenance_mode: false,
    registration_enabled: true,
    whitelist_default: false,
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Sozlamalar
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Tizim sozlamalarini boshqarish
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="cyber-card border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Umumiy sozlamalar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Sayt nomi</Label>
              <Input
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">
                Sayt tavsifi
              </Label>
              <Textarea
                value={settings.site_description}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Ijtimoiy tarmoqlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">
                Discord URL
              </Label>
              <Input
                value={settings.discord_url}
                onChange={(e) =>
                  setSettings({ ...settings, discord_url: e.target.value })
                }
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">
                Telegram URL
              </Label>
              <Input
                value={settings.telegram_url}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_url: e.target.value })
                }
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Tizim sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[var(--text-primary)]">
                  Texnik ish rejimi
                </Label>
                <p className="text-sm text-[var(--text-secondary)]">
                  Saytni texnik ish rejimiga o'tkazish
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[var(--text-primary)]">
                  Ro'yxatdan o'tish
                </Label>
                <p className="text-sm text-[var(--text-secondary)]">
                  Yangi foydalanuvchilar ro'yxatdan o'ta oladi
                </p>
              </div>
              <Switch
                checked={settings.registration_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, registration_enabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[var(--text-primary)]">
                  Whitelist (default)
                </Label>
                <p className="text-sm text-[var(--text-secondary)]">
                  Yangi foydalanuvchilar avtomatik whitelist ga qo'shiladi
                </p>
              </div>
              <Switch
                checked={settings.whitelist_default}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, whitelist_default: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button
          className="cyber-btn w-full"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Saqlash
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
