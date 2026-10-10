"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ManagementToolbar,
  ManagementError,
  ManagementEmpty,
} from "@/components/dashboard/management";

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
  const t = useTranslations("dashboard.copy");
  const m = useTranslations("dashboard.management");
  const locale = useLocale();
  const [serverTypes, setServerTypes] = useState<ServerTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServerTypeConfigDetail | null>(
    null,
  );
  const [deletingType, setDeletingType] = useState<ServerTypeConfig | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [customType, setCustomType] = useState(false);

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
      setLoadError(false);
      const data = await minecraftAPI.getServerTypes(!showInactive);

      if (Array.isArray(data)) {
        setServerTypes(data);
      } else if (data && typeof data === "object" && "results" in data) {
        setServerTypes((data as { results: ServerTypeConfig[] }).results);
      } else {
        console.warn("[v0] Unexpected API response format:", data);
        throw new Error("Unexpected server types response");
      }
    } catch (error) {
      console.error("Server turlarini yuklashda xato:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingType(null);
    setCustomType(false);
    setActionError(null);
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
    setActionError(null);
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
      setActionError(error instanceof Error ? error.message : m("loadFailed"));
    }
  };

  const handleServerTypeSelect = (type: string) => {
    setCustomType(type === "custom");
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
      setActionError(
        error instanceof Error ? error.message : t("something_went_wrong"),
      );
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
      setActionError(
        error instanceof Error
          ? error.message
          : t("could_not_delete_this_item"),
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredTypes = serverTypes.filter((type) =>
    `${type.display_name} ${type.server_type}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="management-page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t("server_types")}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t(
              "configure_installation_and_launch_commands_for_each_server_type",
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
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
              {t("show_inactive_types")}
            </Label>
          </div>
          <Button onClick={handleOpenCreate} className="bg-[var(--primary)]">
            <Plus className="w-4 h-4 mr-2" />
            {t("add_server_type")}
          </Button>
        </div>
      </div>

      <ManagementToolbar
        count={serverTypes.length}
        shown={filteredTypes.length}
        loading={loading || loadError}
        onRefresh={loadServerTypes}
      />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={m("typeSearch")}
        aria-label={m("typeSearch")}
      />
      {actionError && (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {actionError}
        </p>
      )}
      <Card className="cyber-card border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">
            {t("configured_server_types")}
          </CardTitle>
          <CardDescription>
            {t("installation_and_launch_settings_for_your_server_software")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <ManagementError onRetry={loadServerTypes} />
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : filteredTypes.length === 0 ? (
            <ManagementEmpty
              searching={Boolean(searchQuery.trim())}
              action={
                <Button onClick={handleOpenCreate} variant="outline">
                  <Plus className="mr-2 size-4" />
                  {t("add_your_first_server_type")}
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border-color)]">
                  <TableHead className="text-[var(--text-secondary)]">
                    {t("type")}
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    {t("name")}
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    {t("jar_file")}
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    {t("installer")}
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)]">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-[var(--text-secondary)] text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.map((type) => (
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
                                {t("installer")}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t(
                                "this_type_requires_installation_before_launch",
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-[var(--bg-dark)]"
                        >
                          {t("standard")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {type.is_active ? (
                        <Badge className="bg-primary/20 text-primary">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t("active")}
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/20 text-destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t("inactive")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(type)}
                          aria-label={m("editNamed", {
                            name: type.display_name,
                          })}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingType(type);
                            setActionError(null);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                          aria-label={m("deleteNamed", {
                            name: type.display_name,
                          })}
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
        <DialogContent className="management-dialog max-w-2xl bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              {editingType ? "Server Turini Tahrirlash" : t("new_server_type")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "configure_installation_and_launch_commands_for_this_server_type",
              )}
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <p role="alert" className="text-destructive">
              {actionError}
            </p>
          )}

          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
            {!editingType && (
              <div className="space-y-2">
                <Label className="text-[var(--text-primary)]">
                  {t("server_type")}
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
                {customType && (
                  <Input
                    placeholder={t("custom_type_identifier_for_example_mohist")}
                    aria-label={t("custom_type_identifier_for_example_mohist")}
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
              <Label
                htmlFor="server-types-field-1"
                className="text-[var(--text-primary)]"
              >
                {t("display_name")}
              </Label>
              <Input
                id="server-types-field-1"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Paper"
                aria-label="Paper"
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="server-types-field-2"
                className="text-[var(--text-primary)]"
              >
                {t("description")}
              </Label>
              <Textarea
                id="server-types-field-2"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t("paper_a_high_performance_minecraft_server")}
                className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                rows={2}
              />
            </div>

            {/* JAR File Name */}
            <div className="space-y-2">
              <Label
                htmlFor="server-types-field-3"
                className="text-[var(--text-primary)]"
              >
                {t("jar_filename")}
              </Label>
              <Input
                id="server-types-field-3"
                value={formData.jar_file_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jar_file_name: e.target.value,
                  }))
                }
                placeholder="server.jar"
                aria-label="server.jar"
                className="bg-[var(--bg-dark)] border-[var(--border-color)] font-mono"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                {t("the_filename_used_inside_the_server_directory")}
              </p>
            </div>

            {/* Is Installer Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="space-y-1">
                <Label className="text-[var(--text-primary)]">
                  {t("requires_installation")}
                </Label>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t(
                    "for_software_such_as_forge_or_neoforge_that_requires_installation",
                  )}
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
                <Label
                  htmlFor="server-types-field-4"
                  className="text-[var(--text-primary)] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t("installation_command")}
                </Label>
                <Textarea
                  id="server-types-field-4"
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
                <div className="flex items-start gap-2 p-3 rounded bg-primary/10 border border-primary/20">
                  <Info className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-xs text-primary">
                    {t("available_variables")}
                    {"{java}"}, {"{min_ram}"}, {"{max_ram}"}, {"{jar_file}"}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="server-types-field-5"
                className="text-[var(--text-primary)] flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                {t("launch_command")}
              </Label>
              <Textarea
                id="server-types-field-5"
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
              <div className="flex items-start gap-2 p-3 rounded bg-primary/10 border border-primary/20">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-primary">
                  {t("available_variables")}
                  {"{java}"}, {"{min_ram}"}, {"{max_ram}"}, {"{jar_file}"}
                </p>
              </div>
            </div>

            {/* Requires Args File */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="space-y-1">
                <Label className="text-[var(--text-primary)] flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  {t("uses_an_arguments_file")}
                </Label>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("for_forge_neoforge_libraries_unix_args_txt")}
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
                <Label
                  htmlFor="server-types-field-6"
                  className="text-[var(--text-primary)]"
                >
                  {t("arguments_file_pattern")}
                </Label>
                <Input
                  id="server-types-field-6"
                  value={formData.args_file_pattern}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      args_file_pattern: e.target.value,
                    }))
                  }
                  placeholder="libraries/net/minecraftforge/forge/*/unix_args.txt"
                  aria-label="libraries/net/minecraftforge/forge/*/unix_args.txt"
                  className="bg-[var(--bg-dark)] border-[var(--border-color)] font-mono text-sm"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("glob_pattern_use_as_a_version_wildcard")}
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
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving || !formData.server_type || !formData.run_command
              }
              className="bg-[var(--primary)]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingType ? t("save") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="management-dialog bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              {t("delete_server_type")}
            </DialogTitle>
            <DialogDescription>
              "{deletingType?.display_name}
              {t("server_type_this_action_cannot_be_undone")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[var(--border-color)]"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
