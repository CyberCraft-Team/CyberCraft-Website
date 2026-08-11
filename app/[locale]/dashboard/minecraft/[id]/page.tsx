"use client";

import type React from "react";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Send,
  Loader2,
  Terminal,
  Package,
  FolderOpen,
  Users,
  Cpu,
  HardDrive,
  Clock,
  AlertCircle,
  Trash2,
  Upload,
  X,
  Settings,
  Skull,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { minecraftAPI, ServerConsole } from "@/lib/api/minecraft";
import type {
  MinecraftServerDetail,
  ServerLog,
  ServerMod,
  ServerFile,
} from "@/lib/api/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
} from "recharts";

export default function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: serverId } = use(params);
  const router = useRouter();

  const [server, setServer] = useState<MinecraftServerDetail | null>(null);
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [mods, setMods] = useState<ServerMod[]>([]);
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);

  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingMod, setUploadingMod] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Monitoring & Player Management States
  const [statsHistory, setStatsHistory] = useState<{ cpu: number; memory: number; time: string }[]>([]);
  const [onlinePlayerList, setOnlinePlayerList] = useState<string[]>([]);
  const [playerLists, setPlayerLists] = useState<{
    whitelist: { name: string; uuid: string }[];
    ops: { name: string; uuid: string; level: number; bypassesPlayerLimit: boolean }[];
    banned: { name: string; uuid: string; created: string; source: string; expires: string; reason: string }[];
  }>({ whitelist: [], ops: [], banned: [] });
  const [playerListsLoading, setPlayerListsLoading] = useState(false);

  const [newWhitelistedPlayer, setNewWhitelistedPlayer] = useState("");
  const [newOpPlayer, setNewOpPlayer] = useState("");
  const [newBannedPlayer, setNewBannedPlayer] = useState("");
  const [banReason, setBanReason] = useState("");

  const logsEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<ServerConsole | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadServerData();

    consoleRef.current = new ServerConsole(serverId, {
      onLog: (log) => {
        setLogs((prev) => {
          if (log.id && prev.some((item) => item.id === log.id)) {
            return prev;
          }
          return [...prev.slice(-500), log];
        });

        // Dynamic player join/leave syncing in frontend
        if (log.message.includes("joined the game")) {
          const match = log.message.match(/\]: ([a-zA-Z0-9_]+) joined the game/);
          if (match) {
            const name = match[1];
            setOnlinePlayerList((prev) => Array.from(new Set([...prev, name])));
          }
        } else if (log.message.includes("left the game")) {
          const match = log.message.match(/\]: ([a-zA-Z0-9_]+) left the game/);
          if (match) {
            const name = match[1];
            setOnlinePlayerList((prev) => prev.filter((p) => p !== name));
          }
        }
      },
      onStatus: (status) => {
        setServer((prev) => (prev ? { ...prev, status: status as any } : prev));
        if (status === "stopped") {
          setStatsHistory([]);
          setOnlinePlayerList([]);
        }
      },
      onStats: (stats) => {
        const timeStr = new Date(stats.timestamp).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setStatsHistory((prev) => {
          return [...prev.slice(-29), { cpu: stats.cpu, memory: stats.memory, time: timeStr }];
        });
      },
      onError: (error) => {
        console.error("WebSocket error:", error);
      },
      onInitialLogs: (initialLogs) => {
        setLogs(initialLogs);
      },
    });

    return () => {
      consoleRef.current?.disconnect();
    };
  }, [serverId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const loadServerData = async () => {
    setIsLoading(true);
    try {
      const serverData = await minecraftAPI.getServer(serverId);
      const modsData = await minecraftAPI.getMods(serverId);
      const filesData = await minecraftAPI.getFiles(serverId);

      setServer(serverData);
      setMods(modsData);
      setFiles(filesData);
      if (serverData.status_info?.online_player_list) {
        setOnlinePlayerList(serverData.status_info.online_player_list);
      }
    } catch (error) {
      console.error("Error loading server:", error);
      router.push("/dashboard/minecraft");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayerLists = async () => {
    setPlayerListsLoading(true);
    try {
      const data = await minecraftAPI.getPlayers(serverId);
      setPlayerLists(data);
    } catch (e) {
      console.error("Error loading player lists:", e);
    } finally {
      setPlayerListsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayerLists();
  }, [serverId]);

  const handlePlayerAction = async (
    listType: "whitelist" | "ops" | "banned",
    action: "add" | "remove",
    username: string,
    reason?: string
  ) => {
    try {
      await minecraftAPI.updatePlayers(serverId, {
        list_type: listType,
        action,
        username,
        reason,
      });
      await loadPlayerLists();
      
      if (action === "add") {
        if (listType === "whitelist") setNewWhitelistedPlayer("");
        if (listType === "ops") setNewOpPlayer("");
        if (listType === "banned") {
          setNewBannedPlayer("");
          setBanReason("");
        }
      }
    } catch (error: any) {
      alert(error.message || "Xato yuz berdi");
    }
  };

  const handleServerAction = async (
    action: "start" | "stop" | "restart" | "kill",
  ) => {
    setActionLoading(true);
    try {
      if (action === "start") {
        await minecraftAPI.startServer(serverId);
      } else if (action === "stop") {
        await minecraftAPI.stopServer(serverId);
      } else if (action === "restart") {
        await minecraftAPI.restartServer(serverId);
      } else {
        await minecraftAPI.killServer(serverId);
      }

      const targetStatus =
        action === "start"
          ? "running"
          : action === "stop" || action === "kill"
            ? "stopped"
            : null;
      let attempts = 0;
      const maxAttempts = 30;

      const pollStatus = async () => {
        try {
          const serverData = await minecraftAPI.getServer(serverId);
          setServer(serverData);

          if (targetStatus && serverData.status === targetStatus) {
            setActionLoading(false);
            return;
          }

          if (serverData.status === "error") {
            setActionLoading(false);
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 1000);
          } else {
            setActionLoading(false);
          }
        } catch {
          setActionLoading(false);
        }
      };

      setTimeout(pollStatus, 500);
    } catch (error: any) {
      alert(error.message || "Xato yuz berdi");
      setActionLoading(false);
    }
  };

  const handleInstall = async () => {
    setInstallLoading(true);
    try {
      await minecraftAPI.installServer(serverId);
      const pollInterval = setInterval(async () => {
        try {
          const serverData = await minecraftAPI.getServer(serverId);
          setServer(serverData);
          if (
            serverData.is_installed ||
            serverData.status === "stopped" ||
            serverData.status === "error"
          ) {
            clearInterval(pollInterval);
            setInstallLoading(false);
          }
        } catch (e) {
          clearInterval(pollInterval);
          setInstallLoading(false);
        }
      }, 2000);
    } catch (error: any) {
      alert(error.message || "Install qilishda xato yuz berdi");
      setInstallLoading(false);
    }
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setCommandHistory((prev) => [command, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    try {
      if (consoleRef.current) {
        consoleRef.current.sendCommand(command);
      } else {
        await minecraftAPI.sendCommand(serverId, command);
      }
      setCommand("");
    } catch (error: any) {
      alert(error.message || "Command yuborishda xato");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  const handleModUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMod(true);
    try {
      await minecraftAPI.uploadMod(serverId, file);
      const modsData = await minecraftAPI.getMods(serverId);
      setMods(modsData);
    } catch (error: any) {
      alert(error.message || "Mod yuklashda xato");
    } finally {
      setUploadingMod(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleModToggle = async (modId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
      await minecraftAPI.toggleMod(serverId, modId, newStatus);
      setMods((prev) =>
        prev.map((mod) =>
          mod.id === modId ? { ...mod, status: newStatus } : mod,
        ),
      );
    } catch (error: any) {
      alert(error.message || "Mod holatini o'zgartirishda xato");
    }
  };

  const handleModDelete = async (modId: number) => {
    if (!confirm("Modni o'chirishni tasdiqlaysizmi?")) return;

    try {
      await minecraftAPI.deleteMod(serverId, modId);
      setMods((prev) => prev.filter((mod) => mod.id !== modId));
    } catch (error: any) {
      alert(error.message || "Mod o'chirishda xato");
    }
  };

  const handleImageUpload = async (
    type: "icon" | "background" | "gallery",
    file: File,
  ) => {
    setUploadingImage(type);
    try {
      if (type === "gallery") {
        await minecraftAPI.uploadGalleryImage(serverId, file);
      } else {
        await minecraftAPI.uploadServerImages(
          serverId,
          type === "icon" ? file : undefined,
          type === "background" ? file : undefined,
        );
      }
      await loadServerData();
    } catch (error: any) {
      alert(error.message || "Rasm yuklashda xato");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteGalleryImage = async (imageId: number) => {
    if (!confirm("Rasmni o'chirishni tasdiqlaysizmi?")) return;

    try {
      await minecraftAPI.deleteGalleryImage(serverId, imageId);
      await loadServerData();
    } catch (error: any) {
      alert(error.message || "Rasmni o'chirishda xato");
    }
  };

  const handleFileClick = async (file: ServerFile) => {
    if (file.is_directory) {
      const newPath = file.path;
      setCurrentPath(newPath);
      const filesData = await minecraftAPI.getFiles(serverId, newPath);
      setFiles(filesData);
      setFileContent(null);
      setEditingFile(null);
    } else {
      const textExtensions = [
        ".txt",
        ".properties",
        ".json",
        ".yml",
        ".yaml",
        ".cfg",
        ".conf",
        ".log",
      ];
      const isTextFile = textExtensions.some((ext) => file.name.endsWith(ext));

      if (isTextFile && file.size < 1024 * 1024) {
        try {
          const { content } = await minecraftAPI.getFileContent(
            serverId,
            file.path,
          );
          setFileContent(content);
          setEditingFile(file.path);
        } catch (error: any) {
          alert(error.message || "Fayl o'qishda xato");
        }
      }
    }
  };

  const handleGoBack = async () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.join("/");
    setCurrentPath(newPath);
    const filesData = await minecraftAPI.getFiles(serverId, newPath);
    setFiles(filesData);
    setFileContent(null);
    setEditingFile(null);
  };

  const handleSaveFile = async () => {
    if (!editingFile || fileContent === null) return;

    try {
      await minecraftAPI.saveFile(serverId, editingFile, fileContent);
      alert("Fayl saqlandi!");
    } catch (error: any) {
      alert(error.message || "Fayl saqlashda xato");
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-[var(--text-primary)]";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Server topilmadi
        </h2>
      </div>
    );
  }

  const needsInstallation =
    !server.is_installed &&
    (server.server_type?.toLowerCase().includes("forge") ||
      server.server_type?.toLowerCase().includes("neoforge"));

  return (
    <div className="p-8">
      {needsInstallation && (
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <Download className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">
            Server Install Kerak
          </AlertTitle>
          <AlertDescription className="text-yellow-400/80">
            Bu server turi (Forge/NeoForge) ishga tushirishdan oldin install
            qilinishi kerak. Install jarayoni server fayllarini tayyorlaydi va
            kerakli kutubxonalarni yuklab oladi.
            <Button
              className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-black"
              size="sm"
              onClick={handleInstall}
              disabled={installLoading || server.status === "installing"}
            >
              {installLoading || server.status === "installing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install Server
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {server.status === "installing" && (
        <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          <AlertTitle className="text-blue-500">
            Server Install Qilinmoqda
          </AlertTitle>
          <AlertDescription className="text-blue-400/80">
            Server hozirda install qilinmoqda. Bu bir necha daqiqa davom etishi
            mumkin. Iltimos kutib turing...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/minecraft">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {server.name}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {server.server_type} {server.minecraft_version} • Port:{" "}
              {server.port}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
              server.status === "running"
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : server.status === "starting" || server.status === "stopping"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : server.status === "installing"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : server.status === "error"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-gray-500/10 text-gray-400 border-gray-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                server.status === "running"
                  ? "bg-green-400 animate-pulse"
                  : server.status === "starting" ||
                      server.status === "stopping" ||
                      server.status === "installing"
                    ? "bg-yellow-400 animate-pulse"
                    : server.status === "error"
                      ? "bg-red-400"
                      : "bg-gray-400"
              }`}
            />
            {server.status === "running"
              ? "Ishlayapti"
              : server.status === "starting"
                ? "Ishga tushmoqda..."
                : server.status === "stopping"
                  ? "To'xtamoqda..."
                  : server.status === "installing"
                    ? "Install qilinmoqda..."
                    : server.status === "error"
                      ? "Xato"
                      : "To'xtatilgan"}
          </div>

          {server.status === "running" ? (
            <>
              <Button
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 bg-transparent"
                onClick={() => handleServerAction("restart")}
                disabled={actionLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 bg-transparent"
                onClick={() => handleServerAction("stop")}
                disabled={actionLoading}
              >
                <Square className="w-4 h-4 mr-2" />
                To'xtatish
              </Button>
              <Button
                variant="outline"
                className="border-red-700/50 text-red-500 bg-transparent"
                onClick={() => handleServerAction("kill")}
                disabled={actionLoading}
              >
                <Skull className="w-4 h-4 mr-2" />
                Kill
              </Button>
            </>
          ) : (
            <Button
              className="cyber-btn"
              onClick={() => handleServerAction("start")}
              disabled={
                actionLoading ||
                server.status === "starting" ||
                server.status === "installing" ||
                needsInstallation
              }
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Boshlash
            </Button>
          )}

          <Link href={`/dashboard/minecraft/${serverId}/settings`}>
            <Button
              variant="outline"
              className="border-[var(--border-color)] bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Sozlamalar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="cyber-card border-[var(--border-color)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                O'yinchilar
              </p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {server.current_players}/{server.max_players}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card border-[var(--border-color)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">RAM</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {server.min_ram}-{server.max_ram} MB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card border-[var(--border-color)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Modlar</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {mods.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card border-[var(--border-color)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Oxirgi start
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {server.last_started
                  ? new Date(server.last_started).toLocaleString("uz-UZ")
                  : "Hali ishlamagan"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="console" className="space-y-4">
        <TabsList className="bg-[var(--bg-card)] border border-[var(--border-color)]">
          <TabsTrigger
            value="console"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Console
          </TabsTrigger>
          <TabsTrigger
            value="mods"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <Package className="w-4 h-4 mr-2" />
            Modlar
          </TabsTrigger>
          <TabsTrigger
            value="players"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <Users className="w-4 h-4 mr-2" />
            O'yinchilar
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Fayllar
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Rasmlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[var(--primary)]" />
                  Server Vizual Efektlari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Icon Section */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/20 flex items-center justify-center">
                      {server.icon_url ? (
                        <img
                          src={server.icon_url}
                          alt="Icon"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-xl">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("icon", file);
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Server Logotipi</h4>
                    <p className="text-xs text-gray-400 mb-2">
                      Launcherda ko'rinadigan asosiy server iconi. 1:1 nisbatda bo'lishi tavsiya etiladi.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/10 hover:border-[var(--primary)]"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleImageUpload("icon", file);
                        };
                        input.click();
                      }}
                      disabled={uploadingImage === "icon"}
                    >
                      {uploadingImage === "icon" ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3 mr-2" />
                      )}
                      Rasmni almashtirish
                    </Button>
                  </div>
                </div>

                {/* Background Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">Dashboard Fon Rasmi</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--primary)] hover:bg-[var(--primary)]/10"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleImageUpload("background", file);
                        };
                        input.click();
                      }}
                      disabled={uploadingImage === "background"}
                    >
                      {uploadingImage === "background" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Fonni yuklash
                    </Button>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    {server.background_image_url ? (
                      <img
                        src={server.background_image_url}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-600">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">Hali fon rasmi yuklanmagan</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[var(--primary)]" />
                    Skrinshotlar Galereyasi
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-black font-semibold h-8"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload("gallery", file);
                      };
                      input.click();
                    }}
                    disabled={uploadingImage === "gallery"}
                  >
                    {uploadingImage === "gallery" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Rasm qo'shish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {server.gallery_images && server.gallery_images.length > 0 ? (
                    server.gallery_images.map((img) => (
                      <div
                        key={img.id}
                        className="relative group aspect-video rounded-lg overflow-hidden border border-white/5 bg-black/20"
                      >
                        <img
                          src={img.image_url}
                          alt="Server screenshot"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleDeleteGalleryImage(img.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-600">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Galereya bo'sh</p>
                      <p className="text-xs mt-1">Serveringizdan skrinshotlar qo'shing</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Card className="cyber-card border-[var(--border-color)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div
                        className={`w-3 h-3 rounded-full ${server.status === "running" ? "bg-green-500 animate-pulse" : server.status === "stopped" ? "bg-red-500" : "bg-yellow-500 animate-pulse"}`}
                      />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                      <div className="w-3 h-3 rounded-full bg-green-500/30" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">
                        Server Console
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          server.status === "running"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : server.status === "stopped"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {server.status === "running"
                          ? "ONLINE"
                          : server.status === "stopped"
                            ? "OFFLINE"
                            : (server.status || "UNKNOWN").toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{logs.length} log</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogs([])}
                      className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 px-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Tozalash
                    </Button>
                  </div>
                </div>

                <div className="bg-[#0d1117] p-0">
                  <ScrollArea className="h-[420px] font-mono text-[13px]">
                    <div className="p-4 space-y-0.5">
                      {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[350px] text-gray-600">
                          <Terminal className="w-12 h-12 mb-3 opacity-30" />
                          <p className="text-sm">
                            Console loglari bu yerda ko'rsatiladi
                          </p>
                          <p className="text-xs mt-1 text-gray-700">
                            Serverni ishga tushiring va loglarni kuzating
                          </p>
                        </div>
                      ) : (
                        logs.map((log, index) => (
                          <div
                            key={`${log.id ?? "noid"}-${log.timestamp}-${index}`}
                            className={`flex items-start gap-2 py-1 px-2 rounded hover:bg-white/5 group ${getLogColor(log.level)}`}
                          >
                            <span className="text-gray-600 shrink-0 select-none text-xs leading-5">
                              {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                            <span
                              className={`shrink-0 select-none text-xs leading-5 w-12 text-center rounded ${
                                log.level === "error"
                                  ? "bg-red-500/20 text-red-400"
                                  : log.level === "warn"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : log.level === "debug"
                                      ? "bg-gray-500/20 text-gray-400"
                                      : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {log.level === "error"
                                ? "ERR"
                                : log.level === "warn"
                                  ? "WARN"
                                  : log.level === "debug"
                                    ? "DBG"
                                    : "INFO"}
                            </span>
                            <span className="break-all leading-5">
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Command Input */}
                  <div className="border-t border-gray-800 bg-[#161b22] p-3">
                    <form onSubmit={handleSendCommand} className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold font-mono">
                          $
                        </span>
                        <Input
                          ref={commandInputRef}
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={
                            server.status === "running"
                              ? "Buyruq kiriting... (help, stop, list, say Hello!)"
                              : "Server ishlamayapti - avval serverni ishga tushiring"
                          }
                          className="pl-8 bg-[#0d1117] border-gray-700 font-mono text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-green-500/20"
                          disabled={server.status !== "running"}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-500 text-white px-4"
                        disabled={server.status !== "running" || !command.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>

                    {/* Quick Commands */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-600">Tez buyruqlar:</span>
                      {server.status === "running" ? (
                        [
                          "list",
                          "say Hello!",
                          "time set day",
                          "weather clear",
                          "op",
                          "gamemode creative",
                        ].map((cmd) => (
                          <button
                            key={cmd}
                            type="button"
                            onClick={() => {
                              setCommand(cmd);
                              commandInputRef.current?.focus();
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800/50 text-gray-400 hover:bg-green-500/20 hover:text-green-400 border border-gray-700/50 hover:border-green-500/30 transition-all"
                          >
                            {cmd}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600 italic">
                          Server ishga tushirilganda buyruqlar mavjud bo'ladi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="xl:col-span-1 space-y-4">
              <Card className="cyber-card border-[var(--border-color)] bg-black/40">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-semibold text-gray-400 flex justify-between items-center">
                    <span>CPU Boshqaruv</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {statsHistory.length > 0 ? `${statsHistory[statsHistory.length - 1].cpu}%` : "0%"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 h-[120px]">
                  {statsHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-600 italic">
                      Monitoring to'xtatilgan
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} fontSize={10} stroke="#475569" />
                        <ChartTooltip contentStyle={{ background: "#0d1117", borderColor: "#30363d", fontSize: "11px", color: "#fff" }} />
                        <Area type="monotone" dataKey="cpu" stroke="#10b981" fillOpacity={1} fill="url(#cpuGrad)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="cyber-card border-[var(--border-color)] bg-black/40">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-semibold text-gray-400 flex justify-between items-center">
                    <span>RAM Boshqaruv</span>
                    <span className="text-sm font-bold text-purple-400">
                      {statsHistory.length > 0 ? `${Math.round(statsHistory[statsHistory.length - 1].memory)} MB` : "0 MB"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 h-[120px]">
                  {statsHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-600 italic">
                      Monitoring to'xtatilgan
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, server.max_ram]} fontSize={10} stroke="#475569" />
                        <ChartTooltip contentStyle={{ background: "#0d1117", borderColor: "#30363d", fontSize: "11px", color: "#fff" }} />
                        <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#ramGrad)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mods">
          <Card className="cyber-card border-[var(--border-color)]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-[var(--text-primary)]">
                Modlar
              </CardTitle>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleModUpload}
                  accept=".jar"
                  className="hidden"
                />
                <Button
                  className="cyber-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMod}
                >
                  {uploadingMod ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Mod yuklash
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mods.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Hali mod yuklanmagan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mods.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {mod.name}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {mod.file_name} • {formatFileSize(mod.file_size)}
                            {mod.version && ` • v${mod.version}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {mod.status === "enabled"
                              ? "Yoqilgan"
                              : "O'chirilgan"}
                          </span>
                          <Switch
                            checked={mod.status === "enabled"}
                            onCheckedChange={() =>
                              handleModToggle(mod.id, mod.status)
                            }
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleModDelete(mod.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Online players */}
            <Card className="cyber-card border-[var(--border-color)] bg-black/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--primary)]" />
                  Online O'yinchilar ({onlinePlayerList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {onlinePlayerList.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-secondary)] italic">
                    Hech kim online emas
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onlinePlayerList.map((username) => (
                      <div key={username} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)] border border-white/5">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://minotar.net/avatar/${username}/32`}
                            alt={username}
                            className="w-8 h-8 rounded bg-black/40"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://minotar.net/avatar/MHF_Steve/32";
                            }}
                          />
                          <span className="font-semibold text-white">{username}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 h-8"
                            onClick={() => {
                              if (confirm(`${username}ni serverdan kick qilishni tasdiqlaysizmi?`)) {
                                minecraftAPI.sendCommand(serverId, `kick ${username}`);
                              }
                            }}
                          >
                            Kick
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Players list management */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Whitelist Panel */}
                <Card className="cyber-card border-[var(--border-color)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-bold text-white flex justify-between items-center">
                      <span>Oq ro'yxat (Whitelist)</span>
                      <span className="text-xs font-normal text-gray-400">{playerLists.whitelist.length} o'yinchi</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newWhitelistedPlayer}
                        onChange={(e) => setNewWhitelistedPlayer(e.target.value)}
                        placeholder="Player nomi..."
                        className="bg-[#0d1117] border-gray-700 text-sm h-9 text-white placeholder:text-gray-600 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      />
                      <Button
                        size="sm"
                        className="cyber-btn h-9"
                        onClick={() => handlePlayerAction("whitelist", "add", newWhitelistedPlayer)}
                        disabled={!newWhitelistedPlayer.trim()}
                      >
                        Qo'shish
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[250px] border border-white/5 rounded-lg bg-[var(--bg-dark)] p-2">
                      {playerListsLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
                      ) : playerLists.whitelist.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-500 italic">Oq ro'yxat bo'sh</div>
                      ) : (
                        <div className="space-y-1">
                          {playerLists.whitelist.map((p) => (
                            <div key={p.uuid} className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 text-sm">
                              <span className="text-gray-300 font-mono">{p.name}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                                onClick={() => handlePlayerAction("whitelist", "remove", p.name)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Operator (OP) Panel */}
                <Card className="cyber-card border-[var(--border-color)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-bold text-white flex justify-between items-center">
                      <span>Operatorlar (OP)</span>
                      <span className="text-xs font-normal text-gray-400">{playerLists.ops.length} admin</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newOpPlayer}
                        onChange={(e) => setNewOpPlayer(e.target.value)}
                        placeholder="Player nomi..."
                        className="bg-[#0d1117] border-gray-700 text-sm h-9 text-white placeholder:text-gray-600 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      />
                      <Button
                        size="sm"
                        className="cyber-btn h-9"
                        onClick={() => handlePlayerAction("ops", "add", newOpPlayer)}
                        disabled={!newOpPlayer.trim()}
                      >
                        OP qilish
                      </Button>
                    </div>

                    <ScrollArea className="h-[250px] border border-white/5 rounded-lg bg-[var(--bg-dark)] p-2">
                      {playerListsLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
                      ) : playerLists.ops.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-500 italic">Operatorlar yo'q</div>
                      ) : (
                        <div className="space-y-1">
                          {playerLists.ops.map((p) => (
                            <div key={p.uuid} className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 text-sm">
                              <span className="text-gray-300 font-mono">{p.name} (Lvl {p.level})</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                                onClick={() => handlePlayerAction("ops", "remove", p.name)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

              </div>

              {/* Ban List Panel */}
              <Card className="cyber-card border-[var(--border-color)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-bold text-white flex justify-between items-center">
                    <span>Blocklanganlar (Bans)</span>
                    <span className="text-xs font-normal text-gray-400">{playerLists.banned.length} banned</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      value={newBannedPlayer}
                      onChange={(e) => setNewBannedPlayer(e.target.value)}
                      placeholder="Player nomi..."
                      className="bg-[#0d1117] border-gray-700 text-sm h-9 text-white placeholder:text-gray-600 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                    />
                    <Input
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Ban sababi (reason)..."
                      className="bg-[#0d1117] border-gray-700 text-sm h-9 text-white placeholder:text-gray-600 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 md:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-500 text-white h-9"
                      onClick={() => handlePlayerAction("banned", "add", newBannedPlayer, banReason)}
                      disabled={!newBannedPlayer.trim()}
                    >
                      Ban qilish (Block)
                    </Button>
                  </div>

                  <ScrollArea className="h-[180px] border border-white/5 rounded-lg bg-[var(--bg-dark)] p-2">
                    {playerListsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
                    ) : playerLists.banned.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-500 italic">Banned ro'yxati bo'sh</div>
                    ) : (
                      <div className="space-y-1">
                        {playerLists.banned.map((p) => (
                          <div key={p.uuid} className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-sm border-b border-white/5 last:border-0">
                            <div>
                              <p className="font-semibold text-gray-300 font-mono">{p.name}</p>
                              <p className="text-xs text-gray-500">Sabab: {p.reason || "Sabab ko'rsatilmagan"}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-2"
                              onClick={() => handlePlayerAction("banned", "remove", p.name)}
                            >
                              Pardon (Unban)
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card className="cyber-card border-[var(--border-color)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[var(--text-primary)]">
                  Fayllar
                  {currentPath && (
                    <span className="text-sm font-normal text-[var(--text-secondary)] ml-2">
                      /{currentPath}
                    </span>
                  )}
                </CardTitle>
                {currentPath && (
                  <Button variant="ghost" size="sm" onClick={handleGoBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Orqaga
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-1">
                      {files.map((file) => (
                        <div
                          key={file.path}
                          className="flex items-center justify-between p-2 rounded hover:bg-[var(--bg-dark)] cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="flex items-center gap-2">
                            {file.is_directory ? (
                              <FolderOpen className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <HardDrive className="w-4 h-4 text-[var(--text-secondary)]" />
                            )}
                            <span className="text-[var(--text-primary)]">
                              {file.name}
                            </span>
                          </div>
                          {!file.is_directory && (
                            <span className="text-xs text-[var(--text-secondary)]">
                              {formatFileSize(file.size)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  {editingFile ? (
                    <div className="h-[400px] flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {editingFile}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="cyber-btn"
                            onClick={handleSaveFile}
                          >
                            Saqlash
                          </Button>
                        </div>
                      </div>
                      <textarea
                        value={fileContent || ""}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="flex-1 w-full bg-black rounded p-3 font-mono text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-[var(--text-secondary)]">
                      <p>Faylni tanlang</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
