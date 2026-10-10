"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ManagementToolbar,
  ManagementError,
  ManagementEmpty,
} from "@/components/dashboard/management";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, Link } from "@/i18n/navigation";
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
import { Progress } from "@/components/ui/progress";

import useSWR from "swr";
import { apiFetch } from "@/lib/api/fetcher";
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

export default function MinecraftServersPage() {
  const t = useTranslations("dashboard.copy");
  const m = useTranslations("dashboard.management");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") {
      setIsCreateOpen(true);
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [jarFile, setJarFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [archiveType, setArchiveType] = useState<"jar" | "zip">("jar");
  const [uploadProgress, setUploadProgress] = useState(0);
  const jarFileInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);

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

  // Through the proxy on this app's own origin, which attaches the admin
  // token from the HttpOnly cookie. Fetching the Django origin directly
  // carries no credential at all, so the endpoint answered 401 and the page
  // rendered its "no servers yet" state as though the database were empty.
  const {
    data: servers = [],
    isLoading,
    error,
    mutate,
  } = useSWR<MinecraftServer[]>("minecraft/servers/", (path: string) =>
    apiFetch<MinecraftServer[]>(path),
  );

  const requiresLoaderVersion = ["forge", "fabric", "neoforge"].includes(
    formData.server_type,
  );

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (archiveType === "jar" && !jarFile) {
      setErrorMessage(t("please_upload_a_server_jar_file"));
      return;
    }

    if (archiveType === "zip" && !zipFile) {
      setErrorMessage(t("please_upload_a_server_zip_file"));
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage(t("enter_a_server_name"));
      return;
    }

    if (!formData.slug.trim()) {
      setErrorMessage(t("enter_a_slug"));
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
    setUploadProgress(0);

    try {
      let newServer: { id: string };
      if (archiveType === "zip" && zipFile) {
        newServer = await minecraftAPI.createServerWithArchive(
          {
            name: formData.name,
            slug: formData.slug,
            server_jar: "",
            server_type: formData.server_type,
            loader_version: formData.loader_version || null,
            minecraft_version: formData.minecraft_version,
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
            spawn_protection: 16,
            view_distance: 10,
          },
          zipFile,
          setUploadProgress,
        );
      } else if (jarFile) {
        const timestamp = Date.now();
        const uploadedJar = await minecraftAPI.uploadServerJar(
          jarFile,
          {
            name: `${formData.name} JAR ${timestamp}`,
            server_type: formData.server_type,
            minecraft_version: formData.minecraft_version,
            is_default: false,
          },
          setUploadProgress,
        );

        newServer = await minecraftAPI.createServer({
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
      } else {
        throw new Error(t("archive_file_not_found"));
      }

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
      setZipFile(null);
      setArchiveType("jar");
      setErrorMessage(null);
      setUploadProgress(0);

      router.push(`/dashboard/minecraft/${newServer.id}`);
    } catch (err: any) {
      console.error("[v0] Error creating server:", err);
      setErrorMessage(err.message || t("could_not_create_the_server"));
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
      if (action === "start") await minecraftAPI.startServer(serverId);
      else if (action === "stop") await minecraftAPI.stopServer(serverId);
      else await minecraftAPI.restartServer(serverId);

      setTimeout(() => mutate(), 1000);
    } catch (err: any) {
      alert(err.message || t("something_went_wrong"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm(t("delete_this_server_all_server_files_will_be_removed")))
      return;

    try {
      await minecraftAPI.deleteServer(serverId);
      mutate();
    } catch (err: any) {
      alert(err.message || t("could_not_delete_the_server"));
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
        return "bg-primary";
      case "starting":
      case "stopping":
        return "bg-warning";
      case "error":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return t("running");
      case "starting":
        return t("starting");
      case "stopping":
        return t("stopping");
      case "error":
        return t("error");
      default:
        return t("stopped");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="management-page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {t("minecraft_servers")}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {t("create_manage_and_monitor_your_minecraft_servers")}
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
              {t("add_server")}
            </Button>
          </DialogTrigger>
          <DialogContent className="management-dialog cyber-card border-[var(--border-color)] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[var(--text-primary)]">
                {t("create_a_minecraft_server")}
              </DialogTitle>
              <DialogDescription className="text-[var(--text-secondary)]">
                {t(
                  "upload_a_server_jar_or_zip_archive_and_configure_your_server",
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateServer} className="space-y-6 mt-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {t("server_jar_file")}
                </h3>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    {t("file_type")}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={archiveType === "jar" ? "default" : "outline"}
                      className={archiveType === "jar" ? "cyber-btn" : ""}
                      onClick={() => {
                        setArchiveType("jar");
                        setZipFile(null);
                        setUploadProgress(0);
                      }}
                    >
                      JAR
                    </Button>
                    <Button
                      type="button"
                      variant={archiveType === "zip" ? "default" : "outline"}
                      className={archiveType === "zip" ? "cyber-btn" : ""}
                      onClick={() => {
                        setArchiveType("zip");
                        setJarFile(null);
                        setUploadProgress(0);
                        setFormData((prev) => ({
                          ...prev,
                          server_type: "custom",
                          loader_version: "",
                        }));
                      }}
                    >
                      ZIP
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    {archiveType === "jar"
                      ? t("upload_jar_file")
                      : t("upload_zip_file")}
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
                  <input
                    ref={zipFileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setZipFile(file);
                        setErrorMessage(null);
                      }
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() =>
                      archiveType === "jar"
                        ? jarFileInputRef.current?.click()
                        : zipFileInputRef.current?.click()
                    }
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      (archiveType === "jar" && jarFile) ||
                      (archiveType === "zip" && zipFile)
                        ? "border-green-500/50 bg-primary/5"
                        : "border-[var(--border-color)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {(archiveType === "jar" && jarFile) ||
                    (archiveType === "zip" && zipFile) ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileBox className="w-5 h-5 text-primary" />
                        <span className="text-[var(--text-primary)]">
                          {archiveType === "jar"
                            ? jarFile?.name
                            : zipFile?.name}
                        </span>
                        <span className="text-[var(--text-secondary)] text-sm">
                          (
                          {formatFileSize(
                            archiveType === "jar"
                              ? (jarFile?.size ?? 0)
                              : (zipFile?.size ?? 0),
                          )}
                          )
                        </span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2" />
                        <p className="text-[var(--text-primary)]">
                          {archiveType === "jar"
                            ? t("click_to_select_a_jar_file")
                            : t("click_to_select_a_zip_file")}
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">
                          {archiveType === "jar"
                            ? t("paper_spigot_vanilla_and_other_server_types")
                            : t(
                                "upload_a_zip_archive_of_a_prepared_server_directory",
                              )}
                        </p>
                      </div>
                    )}
                  </div>
                  {isSubmitting && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-[var(--text-secondary)]">
                        {t("uploading")}
                        {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {t("basic_information")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-1"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("server_name")}
                    </Label>
                    <Input
                      id="minecraft-field-1"
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
                      aria-label="My Server"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-2"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("slug")}
                    </Label>
                    <Input
                      id="minecraft-field-2"
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
                      aria-label="my-server"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-3"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("server_type")}
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
                      <SelectTrigger
                        id="minecraft-field-3"
                        className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      >
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
                        <SelectItem value="custom">
                          {t("custom_zip_prepared_directory")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-4"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("minecraft_version")}
                    </Label>
                    <Input
                      id="minecraft-field-4"
                      value={formData.minecraft_version}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minecraft_version: e.target.value,
                        })
                      }
                      placeholder="1.20.4"
                      aria-label="1.20.4"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      required
                    />
                  </div>
                </div>

                {requiresLoaderVersion && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-5"
                      className="text-[var(--text-secondary)]"
                    >
                      {formData.server_type.charAt(0).toUpperCase() +
                        formData.server_type.slice(1)}{" "}
                      {t("version")}
                    </Label>
                    <Input
                      id="minecraft-field-5"
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
                      aria-label={
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
                        t("example_47_2_0_forge_version")}
                      {formData.server_type === "fabric" &&
                        t("example_0_15_6_fabric_loader_version")}
                      {formData.server_type === "neoforge" &&
                        t("example_20_4_80_neoforge_version")}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-6"
                      className="text-[var(--text-secondary)]"
                    >
                      Port
                    </Label>
                    <Input
                      id="minecraft-field-6"
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
                    <Label
                      htmlFor="minecraft-field-7"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("player_limit")}
                    </Label>
                    <Input
                      id="minecraft-field-7"
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
                  {t("memory_settings")}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[var(--text-secondary)]">
                        {t("minimum_ram")}
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
                        {t("maximum_ram")}
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
                  {t("game_settings")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-8"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("game_mode")}
                    </Label>
                    <Select
                      value={formData.gamemode}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gamemode: v })
                      }
                    >
                      <SelectTrigger
                        id="minecraft-field-8"
                        className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survival">
                          {t("survival")}
                        </SelectItem>
                        <SelectItem value="creative">
                          {t("creative")}
                        </SelectItem>
                        <SelectItem value="adventure">
                          {t("adventure")}
                        </SelectItem>
                        <SelectItem value="spectator">
                          {t("spectator")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="minecraft-field-9"
                      className="text-[var(--text-secondary)]"
                    >
                      {t("difficulty")}
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) =>
                        setFormData({ ...formData, difficulty: v })
                      }
                    >
                      <SelectTrigger
                        id="minecraft-field-9"
                        className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peaceful">
                          {t("peaceful")}
                        </SelectItem>
                        <SelectItem value="easy">{t("easy")}</SelectItem>
                        <SelectItem value="normal">{t("normal")}</SelectItem>
                        <SelectItem value="hard">{t("hard")}</SelectItem>
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
                      {t("online_mode")}
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
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="cyber-btn"
                  disabled={
                    isSubmitting ||
                    (archiveType === "jar" ? !jarFile : !zipFile)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("create")
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
            placeholder={t("search_servers")}
            aria-label={t("search_servers")}
            className="pl-10 bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
      </div>

      <ManagementToolbar
        count={servers.length}
        shown={filteredServers.length}
        loading={isLoading || Boolean(error)}
        onRefresh={async () => {
          await mutate();
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : error ? (
        <ManagementError
          onRetry={async () => {
            await mutate();
          }}
        />
      ) : filteredServers.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="w-16 h-16 text-[var(--text-secondary)] mb-4" />
            <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
              {t("no_servers_yet")}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {searchQuery
                ? t("no_results_match_your_search")
                : t("add_your_first_server_to_start_managing_minecraft")}
            </p>
            {!searchQuery && (
              <Button
                className="cyber-btn"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("create_server")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
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
                      {t("version_79")}
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {server.server_type} {server.minecraft_version}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {t("players")}
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
                        className="flex-1 bg-primary/20 text-primary hover:bg-primary/30"
                        onClick={() => handleServerAction(server.id, "start")}
                        disabled={actionLoading === server.id}
                      >
                        {actionLoading === server.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            {t("start")}
                          </>
                        )}
                      </Button>
                    ) : server.status === "running" ? (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-destructive/20 text-destructive hover:bg-destructive/30"
                          onClick={() => handleServerAction(server.id, "stop")}
                          disabled={actionLoading === server.id}
                        >
                          {actionLoading === server.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Square className="w-4 h-4 mr-1" />
                              {t("stop")}
                            </>
                          )}
                        </Button>
                        <Button
                          aria-label={t("restart")}
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
                        aria-label={t("console")}
                        size="sm"
                        variant="outline"
                        className="border-[var(--border-color)] bg-transparent"
                      >
                        <Terminal className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Link href={`/dashboard/minecraft/${server.id}/settings`}>
                      <Button
                        aria-label={t("settings")}
                        size="sm"
                        variant="outline"
                        className="border-[var(--border-color)] bg-transparent"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      aria-label={t("delete")}
                      size="sm"
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/20 bg-transparent"
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
