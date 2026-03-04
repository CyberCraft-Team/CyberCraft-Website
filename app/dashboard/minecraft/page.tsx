"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Server,
  Plus,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Loader2,
  Search,
  Settings,
  Terminal,
  HardDrive,
  Users,
  Clock,
  Cpu,
  Upload,
  FileBox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getAdminToken } from "@/lib/api/hooks";
import useSWR from "swr";
import { minecraftAPI } from "@/lib/api/minecraft";

interface MinecraftServer {
  id: string;
  name: string;
  slug: string;
  server_type: string;
  minecraft_version: string;
  status: string;
  port: number;
  current_players: number;
  max_players: number;
  ram_usage?: number;
  max_ram: number;
  uptime?: number;
  created_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const fetcher = async (url: string) => {
  const token = getAdminToken();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
};

export default function MinecraftServersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [jarFile, setJarFile] = useState<File | null>(null);
  const jarFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    server_type: "paper",
    minecraft_version: "1.20.4",
    loader_version: "",
    port: 25565,
    min_ram: 1024,
    max_ram: 2048,
    max_players: 20,
    motd: "A CyberCraft Minecraft Server",
    gamemode: "survival",
    difficulty: "normal",
    pvp: true,
    online_mode: false,
    white_list: false,
  });

  const {
    data: servers = [],
    isLoading,
    mutate,
  } = useSWR<MinecraftServer[]>(`${API_BASE_URL}/minecraft/servers/`, fetcher);

  const requiresLoaderVersion = ["forge", "fabric", "neoforge"].includes(
    formData.server_type,
  );

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!jarFile) {
      setErrorMessage("Iltimos, server JAR faylini yuklang");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Server nomini kiriting");
      return;
    }

    if (!formData.slug.trim()) {
      setErrorMessage("Slug kiriting");
      return;
    }

    if (requiresLoaderVersion && !formData.loader_version.trim()) {
      setErrorMessage(
        `${
          formData.server_type.charAt(0).toUpperCase() +
          formData.server_type.slice(1)
        } versiyasini kiriting`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error("Avtorizatsiya tokeni topilmadi. Qayta login qiling.");
      }

      const timestamp = Date.now();
      console.log("[v0] Uploading JAR with data:", {
        name: `${formData.name} JAR ${timestamp}`,
        server_type: formData.server_type,
        minecraft_version: formData.minecraft_version,
      });

      const uploadedJar = await minecraftAPI.uploadServerJar(jarFile, {
        name: `${formData.name} JAR ${timestamp}`,
        server_type: formData.server_type,
        minecraft_version: formData.minecraft_version,
        is_default: false,
      });

      console.log("[v0] Uploaded JAR response:", uploadedJar);

      const newServer = await minecraftAPI.createServer({
        name: formData.name,
        slug: formData.slug,
        server_jar: uploadedJar.id,
        loader_version: formData.loader_version || null,
        port: formData.port,
        min_ram: formData.min_ram,
        max_ram: formData.max_ram,
        max_players: formData.max_players,
        motd: formData.motd,
        gamemode: formData.gamemode,
        difficulty: formData.difficulty,
        pvp: formData.pvp,
        online_mode: formData.online_mode,
        white_list: formData.white_list,
      });

      setIsCreateOpen(false);

      setFormData({
        name: "",
        slug: "",
        server_type: "paper",
        minecraft_version: "1.20.4",
        loader_version: "",
        port: 25565,
        min_ram: 1024,
        max_ram: 2048,
        max_players: 20,
        motd: "A CyberCraft Minecraft Server",
        gamemode: "survival",
        difficulty: "normal",
        pvp: true,
        online_mode: false,
        white_list: false,
      });
      setJarFile(null);
      setErrorMessage(null);

      router.push(`/dashboard/minecraft/${newServer.id}`);
    } catch (err: any) {
      console.error("[v0] Error creating server:", err);
      setErrorMessage(err.message || "Server yaratishda xato");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServerAction = async (
    serverId: string,
    action: "start" | "stop" | "restart",
  ) => {
    setActionLoading(serverId);
    try {
      const token = getAdminToken();
      const response = await fetch(
        `${API_BASE_URL}/minecraft/servers/${serverId}/${action}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Xato yuz berdi");
      }

      setTimeout(() => mutate(), 1000);
    } catch (err: any) {
      alert(err.message || "Xato yuz berdi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (
      !confirm(
        "Serverni o'chirishni tasdiqlaysizmi? Barcha fayllar o'chiriladi!",
      )
    )
      return;

    try {
      const token = getAdminToken();
      const response = await fetch(
        `${API_BASE_URL}/minecraft/servers/${serverId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server o'chirishda xato");
      }

      mutate();
    } catch (err: any) {
      alert(err.message || "Server o'chirishda xato");
    }
  };

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.minecraft_version.includes(searchQuery),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "starting":
      case "stopping":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "Ishlayapti";
      case "starting":
        return "Ishga tushmoqda";
      case "stopping":
        return "To'xtamoqda";
      case "error":
        return "Xato";
      default:
        return "To'xtatilgan";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Minecraft Serverlar
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Serverlarni yaratish, boshqarish va monitoring qilish
          </p>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setErrorMessage(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="cyber-btn">
              <Plus className="w-4 h-4 mr-2" />
              Yangi server
            </Button>
          </DialogTrigger>
          <DialogContent className="cyber-card border-[var(--border-color)] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[var(--text-primary)]">
                Yangi Minecraft server yaratish
              </DialogTitle>
              <DialogDescription className="text-[var(--text-secondary)]">
                Server JAR faylini yuklang va sozlamalarni kiriting
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateServer} className="space-y-6 mt-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  Server JAR fayli
                </h3>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    JAR fayl yuklash *
                  </Label>
                  <input
                    ref={jarFileInputRef}
                    type="file"
                    accept=".jar"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setJarFile(file);
                        setErrorMessage(null);
                      }
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => jarFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      jarFile
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-[var(--border-color)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {jarFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileBox className="w-5 h-5 text-green-400" />
                        <span className="text-[var(--text-primary)]">
                          {jarFile.name}
                        </span>
                        <span className="text-[var(--text-secondary)] text-sm">
                          ({formatFileSize(jarFile.size)})
                        </span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2" />
                        <p className="text-[var(--text-primary)]">
                          JAR faylni tanlash uchun bosing
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">
                          Paper, Spigot, Vanilla va boshqalar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  Asosiy ma'lumotlar
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Server nomi *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        // Auto-generate slug
                        if (
                          !formData.slug ||
                          formData.slug ===
                            formData.name.toLowerCase().replace(/\s+/g, "-")
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, ""),
                          }));
                        }
                      }}
                      placeholder="My Server"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Slug *
                    </Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      placeholder="my-server"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Server turi
                    </Label>
                    <Select
                      value={formData.server_type}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          server_type: v,
                          loader_version: "",
                        })
                      }
                    >
                      <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vanilla">Vanilla</SelectItem>
                        <SelectItem value="paper">Paper</SelectItem>
                        <SelectItem value="spigot">Spigot</SelectItem>
                        <SelectItem value="purpur">Purpur</SelectItem>
                        <SelectItem value="fabric">Fabric</SelectItem>
                        <SelectItem value="forge">Forge</SelectItem>
                        <SelectItem value="neoforge">NeoForge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Minecraft versiya
                    </Label>
                    <Input
                      value={formData.minecraft_version}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minecraft_version: e.target.value,
                        })
                      }
                      placeholder="1.20.4"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                </div>

                {requiresLoaderVersion && (
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      {formData.server_type.charAt(0).toUpperCase() +
                        formData.server_type.slice(1)}{" "}
                      versiyasi *
                    </Label>
                    <Input
                      value={formData.loader_version}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loader_version: e.target.value,
                        })
                      }
                      placeholder={
                        formData.server_type === "forge"
                          ? "47.2.0"
                          : formData.server_type === "fabric"
                            ? "0.15.6"
                            : formData.server_type === "neoforge"
                              ? "20.4.80"
                              : ""
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formData.server_type === "forge" &&
                        "Masalan: 47.2.0 (Forge versiyasi)"}
                      {formData.server_type === "fabric" &&
                        "Masalan: 0.15.6 (Fabric Loader versiyasi)"}
                      {formData.server_type === "neoforge" &&
                        "Masalan: 20.4.80 (NeoForge versiyasi)"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">Port</Label>
                    <Input
                      type="number"
                      value={formData.port}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          port: Number.parseInt(e.target.value) || 25565,
                        })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Max o'yinchilar
                    </Label>
                    <Input
                      type="number"
                      value={formData.max_players}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_players: Number.parseInt(e.target.value) || 20,
                        })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  RAM sozlamalari
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[var(--text-secondary)]">
                        Minimum RAM
                      </Label>
                      <span className="text-sm text-[var(--primary)]">
                        {formData.min_ram} MB
                      </span>
                    </div>
                    <Slider
                      value={[formData.min_ram]}
                      onValueChange={(v) =>
                        setFormData({ ...formData, min_ram: v[0] })
                      }
                      min={512}
                      max={8192}
                      step={256}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[var(--text-secondary)]">
                        Maximum RAM
                      </Label>
                      <span className="text-sm text-[var(--primary)]">
                        {formData.max_ram} MB
                      </span>
                    </div>
                    <Slider
                      value={[formData.max_ram]}
                      onValueChange={(v) =>
                        setFormData({ ...formData, max_ram: v[0] })
                      }
                      min={512}
                      max={16384}
                      step={256}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  O'yin sozlamalari
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Gamemode
                    </Label>
                    <Select
                      value={formData.gamemode}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gamemode: v })
                      }
                    >
                      <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survival">Survival</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="spectator">Spectator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Difficulty
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) =>
                        setFormData({ ...formData, difficulty: v })
                      }
                    >
                      <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peaceful">Peaceful</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">PvP</Label>
                    <Switch
                      checked={formData.pvp}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, pvp: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Online Mode
                    </Label>
                    <Switch
                      checked={formData.online_mode}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, online_mode: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Whitelist
                    </Label>
                    <Switch
                      checked={formData.white_list}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, white_list: v })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="border-[var(--border-color)]"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="cyber-btn"
                  disabled={isSubmitting || !jarFile}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    "Yaratish"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Serverlarni qidirish..."
            className="pl-10 bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : filteredServers.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="w-16 h-16 text-[var(--text-secondary)] mb-4" />
            <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
              Hozircha serverlar yo'q
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {searchQuery
                ? "Qidiruv bo'yicha natija topilmadi"
                : "Hozircha hech qanday server yaratilmagan"}
            </p>
            {!searchQuery && (
              <Button
                className="cyber-btn"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Yangi server yaratish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <Card
              key={server.id}
              className="cyber-card hover:border-[var(--primary)]/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="w-5 h-5 text-[var(--primary)]" />
                    {server.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        server.status,
                      )}`}
                    />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {getStatusText(server.status)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] flex items-center gap-1">
                      <HardDrive className="w-4 h-4" />
                      Versiya
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {server.server_type} {server.minecraft_version}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      O'yinchilar
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {server.current_players}/{server.max_players}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] flex items-center gap-1">
                      <Cpu className="w-4 h-4" />
                      RAM
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {server.max_ram} MB
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Port
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {server.port}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[var(--border-color)]">
                    {server.status === "stopped" ||
                    server.status === "error" ? (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        onClick={() => handleServerAction(server.id, "start")}
                        disabled={actionLoading === server.id}
                      >
                        {actionLoading === server.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Ishga tushirish
                          </>
                        )}
                      </Button>
                    ) : server.status === "running" ? (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          onClick={() => handleServerAction(server.id, "stop")}
                          disabled={actionLoading === server.id}
                        >
                          {actionLoading === server.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Square className="w-4 h-4 mr-1" />
                              To'xtatish
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[var(--border-color)] bg-transparent"
                          onClick={() =>
                            handleServerAction(server.id, "restart")
                          }
                          disabled={actionLoading === server.id}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1" disabled>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        {getStatusText(server.status)}
                      </Button>
                    )}

                    <Link href={`/dashboard/minecraft/${server.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[var(--border-color)] bg-transparent"
                      >
                        <Terminal className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Link href={`/dashboard/minecraft/${server.id}/settings`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[var(--border-color)] bg-transparent"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent"
                      onClick={() => handleDeleteServer(server.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
