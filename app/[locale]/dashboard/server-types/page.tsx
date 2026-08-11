"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Server,
  Terminal,
  Download,
  FileCode,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { minecraftAPI } from "@/lib/api/minecraft";
import type {
  ServerTypeConfig,
  ServerTypeConfigDetail,
  CreateServerTypeConfigRequest,
} from "@/lib/api/types";

const SERVER_TYPE_PRESETS = [
  { value: "vanilla", label: "Vanilla" },
  { value: "paper", label: "Paper" },
  { value: "spigot", label: "Spigot" },
  { value: "purpur", label: "Purpur" },
  { value: "fabric", label: "Fabric" },
  { value: "forge", label: "Forge" },
  { value: "neoforge", label: "NeoForge" },
  { value: "custom", label: "Custom" },
];

const DEFAULT_RUN_COMMANDS: Record<string, string> = {
  vanilla: "java -Xms{min_ram}M -Xmx{max_ram}M -jar {jar_file} nogui",
  paper: "java -Xms{min_ram}M -Xmx{max_ram}M -jar {jar_file} nogui",
  spigot: "java -Xms{min_ram}M -Xmx{max_ram}M -jar {jar_file} nogui",
  purpur: "java -Xms{min_ram}M -Xmx{max_ram}M -jar {jar_file} nogui",
  fabric:
    "java -Xms{min_ram}M -Xmx{max_ram}M -jar fabric-server-launch.jar nogui",
  forge: "java -Xms{min_ram}M -Xmx{max_ram}M @user_jvm_args.txt nogui",
  neoforge: "java -Xms{min_ram}M -Xmx{max_ram}M @user_jvm_args.txt nogui",
};

const DEFAULT_INSTALL_COMMANDS: Record<string, string> = {
  forge: "java -jar {jar_file} --installServer",
  neoforge: "java -jar {jar_file} --installServer",
};

export default function ServerTypesPage() {
  const [serverTypes, setServerTypes] = useState<ServerTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServerTypeConfigDetail | null>(
    null
  );
  const [deletingType, setDeletingType] = useState<ServerTypeConfig | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState<CreateServerTypeConfigRequest>({
    server_type: "",
    display_name: "",
    description: "",
    is_installer: false,
    install_command: "",
    run_command: "",
    requires_args_file: false,
    args_file_pattern: "",
    jar_file_name: "server.jar",
    is_active: true,
  });

  useEffect(() => {
    loadServerTypes();
  }, [showInactive]);

  const loadServerTypes = async () => {
    try {
      setLoading(true);
      const data = await minecraftAPI.getServerTypes(!showInactive);
      console.log("[v0] Server types API response:", data);

      if (Array.isArray(data)) {
        setServerTypes(data);
      } else if (data && typeof data === "object" && "results" in data) {
        setServerTypes((data as { results: ServerTypeConfig[] }).results);
      } else {
        console.warn("[v0] Unexpected API response format:", data);
        setServerTypes([]);
      }
    } catch (error) {
      console.error("Server turlarini yuklashda xato:", error);
      setServerTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({
      server_type: "",
      display_name: "",
      description: "",
      is_installer: false,
      install_command: "",
      run_command: DEFAULT_RUN_COMMANDS.vanilla,
      requires_args_file: false,
      args_file_pattern: "",
      jar_file_name: "server.jar",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = async (serverType: ServerTypeConfig) => {
    try {
      const detail = await minecraftAPI.getServerType(serverType.server_type);
      setEditingType(detail);
      setFormData({
        server_type: detail.server_type,
        display_name: detail.display_name,
        description: detail.description,
        is_installer: detail.is_installer,
        install_command: detail.install_command,
        run_command: detail.run_command,
        requires_args_file: detail.requires_args_file,
        args_file_pattern: detail.args_file_pattern,
        jar_file_name: detail.jar_file_name,
        is_active: detail.is_active,
      });
      setDialogOpen(true);
    } catch (error) {
      console.error("Server turini yuklashda xato:", error);
    }
  };

  const handleServerTypeSelect = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      server_type: type,
      display_name:
        SERVER_TYPE_PRESETS.find((p) => p.value === type)?.label || type,
      run_command: DEFAULT_RUN_COMMANDS[type] || DEFAULT_RUN_COMMANDS.vanilla,
      is_installer: type === "forge" || type === "neoforge",
      install_command: DEFAULT_INSTALL_COMMANDS[type] || "",
      requires_args_file: type === "forge" || type === "neoforge",
      args_file_pattern:
        type === "forge"
          ? "libraries/net/minecraftforge/forge/*/unix_args.txt"
          : type === "neoforge"
          ? "libraries/net/neoforged/neoforge/*/unix_args.txt"
          : "",
      jar_file_name:
        type === "fabric" ? "fabric-server-launch.jar" : "server.jar",
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingType) {
        await minecraftAPI.updateServerType(editingType.server_type, formData);
      } else {
        await minecraftAPI.createServerType(formData);
      }

      setDialogOpen(false);
      loadServerTypes();
    } catch (error) {
      console.error("Saqlashda xato:", error);
      alert(error instanceof Error ? error.message : "Xato yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingType) return;

    try {
      setSaving(true);
      await minecraftAPI.deleteServerType(deletingType.server_type);
      setDeleteDialogOpen(false);
      setDeletingType(null);
      loadServerTypes();
    } catch (error) {
      console.error("O'chirishda xato:", error);
      alert(error instanceof Error ? error.message : "O'chirishda xato");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Server Turlari
          </h1>
          <p className="text-[var(--text-secondary)]">
            Minecraft server turlarini boshqaring (install va run commandlar)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="showInactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label
              htmlFor="showInactive"
              className="text-[var(--text-secondary)]"
            >
              Noaktiv turlarni ko'rsatish
            </Label>
          </div>
          <Button onClick={handleOpenCreate} className="bg-[var(--primary)]">
            <Plus className="w-4 h-4 mr-2" />
            Yangi tur qo'shish
          </Button>
        </div>
      </div>

      <Card className="cyber-card border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">
            Server Turlari Ro'yxati
          </CardTitle>
          <CardDescription>
            Har bir server turi uchun install va run commandlarni sozlang
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : serverTypes.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 mx-auto mb-4 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-secondary)]">
                Hech qanday server turi topilmadi
              </p>
              <Button
                onClick={handleOpenCreate}
                variant="outline"
                className="mt-4 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Birinchi turni qo'shing
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border-color)]">
                  <TableHead className="text-[var(--text-secondary)]">
                    Tur
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    Nomi
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    JAR fayl
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    Installer
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    Status
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)] text-right">
                    Amallar
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serverTypes.map((type) => (
                  <TableRow
                    key={type.server_type}
                    className="border-[var(--border-color)]"
                  >
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {type.server_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-[var(--text-primary)]">
                      {type.display_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[var(--text-secondary)]">
                      {type.jar_file_name}
                    </TableCell>
                    <TableCell>
                      {type.is_installer ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge className="bg-orange-500/20 text-orange-400">
                                <Download className="w-3 h-3 mr-1" />
                                Installer
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Bu tur avval install qilinishi kerak
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-[var(--bg-dark)]"
                        >
                          Oddiy
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {type.is_active ? (
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3 mr-1" />
                          Noaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(type)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingType(type);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              {editingType ? "Server Turini Tahrirlash" : "Yangi Server Turi"}
            </DialogTitle>
            <DialogDescription>
              Server turi uchun install va run commandlarni sozlang
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
            {!editingType && (
              <div className="space-y-2">
                <Label className="text-[var(--text-primary)]">
                  Server Turi
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {SERVER_TYPE_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={
                        formData.server_type === preset.value
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleServerTypeSelect(preset.value)}
                      className={
                        formData.server_type === preset.value
                          ? "bg-[var(--primary)]"
                          : "border-[var(--border-color)]"
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                {formData.server_type === "custom" && (
                  <Input
                    placeholder="Custom tur nomi (masalan: mohist)"
                    value={
                      formData.server_type === "custom"
                        ? ""
                        : formData.server_type
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        server_type: e.target.value,
                      }))
                    }
                    className="mt-2 bg-[var(--bg-dark)] border-[var(--border-color)]"
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[var(--text-primary)]">
                Ko'rsatiladigan nom
              </Label>
              <Input
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Paper"
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-[var(--text-primary)]">Tavsif</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Paper - yuqori performance Minecraft serveri"
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                rows={2}
              />
            </div>

            {/* JAR File Name */}
            <div className="space-y-2">
              <Label className="text-[var(--text-primary)]">
                JAR fayl nomi
              </Label>
              <Input
                value={formData.jar_file_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jar_file_name: e.target.value,
                  }))
                }
                placeholder="server.jar"
                className="bg-[var(--bg-dark)] border-[var(--border-color)] font-mono"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Server papkasida JAR fayl qanday nomda saqlanadi
              </p>
            </div>

            {/* Is Installer Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="space-y-1">
                <Label className="text-[var(--text-primary)]">
                  Installer turi
                </Label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Forge, NeoForge kabi avval install qilinadigan turlar uchun
                </p>
              </div>
              <Switch
                checked={formData.is_installer}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_installer: checked }))
                }
              />
            </div>

            {/* Install Command (only if installer) */}
            {formData.is_installer && (
              <div className="space-y-2">
                <Label className="text-[var(--text-primary)] flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Install Command
                </Label>
                <Textarea
                  value={formData.install_command}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      install_command: e.target.value,
                    }))
                  }
                  placeholder="java -jar {jar_file} --installServer"
                  className="bg-[var(--bg-dark)] border-[var(--border-color)] font-mono text-sm"
                  rows={2}
                />
                <div className="flex items-start gap-2 p-3 rounded bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                  <p className="text-xs text-blue-400">
                    Mavjud o'zgaruvchilar: {"{java}"}, {"{min_ram}"},{" "}
                    {"{max_ram}"}, {"{jar_file}"}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[var(--text-primary)] flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Run Command
              </Label>
              <Textarea
                value={formData.run_command}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    run_command: e.target.value,
                  }))
                }
                placeholder="java -Xms{min_ram}M -Xmx{max_ram}M -jar {jar_file} nogui"
                className="bg-[var(--bg-dark)] border-[var(--border-color)] font-mono text-sm"
                rows={2}
              />
              <div className="flex items-start gap-2 p-3 rounded bg-blue-500/10 border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <p className="text-xs text-blue-400">
                  Mavjud o'zgaruvchilar: {"{java}"}, {"{min_ram}"},{" "}
                  {"{max_ram}"}, {"{jar_file}"}
                </p>
              </div>
            </div>

            {/* Requires Args File */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="space-y-1">
                <Label className="text-[var(--text-primary)] flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Args fayl ishlatiladi
                </Label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Forge/NeoForge uchun @libraries/.../unix_args.txt
                </p>
              </div>
              <Switch
                checked={formData.requires_args_file}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    requires_args_file: checked,
                  }))
                }
              />
            </div>

            {/* Args File Pattern */}
            {formData.requires_args_file && (
              <div className="space-y-2">
                <Label className="text-[var(--text-primary)]">
                  Args fayl pattern
                </Label>
                <Input
                  value={formData.args_file_pattern}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      args_file_pattern: e.target.value,
                    }))
                  }
                  placeholder="libraries/net/minecraftforge/forge/*/unix_args.txt"
                  className="bg-[var(--bg-dark)] border-[var(--border-color)] font-mono text-sm"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  Glob pattern - * versiya uchun wildcard sifatida ishlatiladi
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-[var(--border-color)]"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving || !formData.server_type || !formData.run_command
              }
              className="bg-[var(--primary)]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingType ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              Server turini o'chirish
            </DialogTitle>
            <DialogDescription>
              "{deletingType?.display_name}" server turini o'chirmoqchimisiz? Bu
              amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[var(--border-color)]"
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
