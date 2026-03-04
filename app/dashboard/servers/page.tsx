"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  MoreVertical,
  Plus,
  Server,
  Globe,
  Users,
  Wifi,
  WifiOff,
  Wrench,
  Trash2,
  Edit,
  ExternalLink,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPublicServers, getAdminToken } from "@/lib/api/hooks";
import type { Server as ServerType } from "@/lib/api/types";

interface ServerFormData {
  name: string;
  slug: string;
  ip_address: string;
  port: number;
  status: "online" | "offline" | "maintenance";
  max_players: number;
  current_players: number;
  description: string;
  whitelist_enabled: boolean;
  min_ram: number;
  max_ram: number;
}

const defaultFormData: ServerFormData = {
  name: "",
  slug: "",
  ip_address: "",
  port: 25565,
  status: "offline",
  max_players: 20,
  current_players: 0,
  description: "",
  whitelist_enabled: false,
  min_ram: 2048,
  max_ram: 4096,
};

export default function PublicServersPage() {
  const { servers, isLoading, mutate } = useAdminPublicServers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerType | null>(null);
  const [formData, setFormData] = useState<ServerFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.ip_address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4 text-[var(--accent)]" />;
      case "maintenance":
        return <Wrench className="w-4 h-4 text-[var(--warning)]" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-[var(--accent)]/20 text-[var(--accent)]";
      case "maintenance":
        return "bg-[var(--warning)]/20 text-[var(--warning)]";
      default:
        return "bg-red-500/20 text-red-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "maintenance":
        return "Texnik ishlar";
      default:
        return "Offline";
    }
  };

  const handleCreate = () => {
    setFormData(defaultFormData);
    setError(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (server: ServerType) => {
    setSelectedServer(server);
    setFormData({
      name: server.name,
      slug: server.slug,
      ip_address: server.ip_address,
      port: server.port,
      status: server.status,
      max_players: server.max_players,
      current_players: server.current_players,
      description: server.description || "",
      whitelist_enabled: server.whitelist_enabled,
      min_ram: server.min_ram,
      max_ram: server.max_ram,
    });
    setError(null);
    setIsEditOpen(true);
  };

  const handleDelete = (server: ServerType) => {
    setSelectedServer(server);
    setIsDeleteOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmitCreate = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const token = getAdminToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/servers/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.detail || "Server yaratishda xato");
      }

      mutate();
      setIsCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedServer) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const token = getAdminToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/servers/${selectedServer.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.detail || "Server yangilashda xato");
      }

      mutate();
      setIsEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedServer) return;
    setIsSubmitting(true);
    try {
      const token = getAdminToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/servers/${selectedServer.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      mutate();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = (isEdit: boolean = false) => (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-name" : "create-name"}>
            Server nomi
          </Label>
          <Input
            id={isEdit ? "edit-name" : "create-name"}
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData((prev) => ({
                ...prev,
                name,
                slug: isEdit ? prev.slug : generateSlug(name),
              }));
            }}
            placeholder="CyberCraft Main"
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-slug" : "create-slug"}>Slug</Label>
          <Input
            id={isEdit ? "edit-slug" : "create-slug"}
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            placeholder="cybercraft-main"
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-ip" : "create-ip"}>IP manzil</Label>
          <Input
            id={isEdit ? "edit-ip" : "create-ip"}
            value={formData.ip_address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, ip_address: e.target.value }))
            }
            placeholder="play.cybercraft.uz"
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-port" : "create-port"}>Port</Label>
          <Input
            id={isEdit ? "edit-port" : "create-port"}
            type="number"
            value={formData.port}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                port: parseInt(e.target.value) || 25565,
              }))
            }
            placeholder="25565"
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-status" : "create-status"}>
            Holat
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value: "online" | "offline" | "maintenance") =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
              <SelectValue placeholder="Holatni tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Texnik ishlar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-current" : "create-current"}>
            Hozirgi o'yinchilar
          </Label>
          <Input
            id={isEdit ? "edit-current" : "create-current"}
            type="number"
            value={formData.current_players}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                current_players: parseInt(e.target.value) || 0,
              }))
            }
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-max" : "create-max"}>
            Maksimum o'yinchilar
          </Label>
          <Input
            id={isEdit ? "edit-max" : "create-max"}
            type="number"
            value={formData.max_players}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                max_players: parseInt(e.target.value) || 20,
              }))
            }
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-minram" : "create-minram"}>
            Minimum RAM (MB)
          </Label>
          <Input
            id={isEdit ? "edit-minram" : "create-minram"}
            type="number"
            value={formData.min_ram}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                min_ram: parseInt(e.target.value) || 2048,
              }))
            }
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-maxram" : "create-maxram"}>
            Maksimum RAM (MB)
          </Label>
          <Input
            id={isEdit ? "edit-maxram" : "create-maxram"}
            type="number"
            value={formData.max_ram}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                max_ram: parseInt(e.target.value) || 4096,
              }))
            }
            className="bg-[var(--bg-dark)] border-[var(--border-color)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-desc" : "create-desc"}>Tavsif</Label>
        <Textarea
          id={isEdit ? "edit-desc" : "create-desc"}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Server haqida qisqacha ma'lumot..."
          className="bg-[var(--bg-dark)] border-[var(--border-color)] min-h-[80px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={isEdit ? "edit-whitelist" : "create-whitelist"}
          checked={formData.whitelist_enabled}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              whitelist_enabled: e.target.checked,
            }))
          }
          className="rounded border-[var(--border-color)] w-4 h-4 accent-[var(--primary)]"
        />
        <Label htmlFor={isEdit ? "edit-whitelist" : "create-whitelist"}>
          Whitelist yoqilgan
        </Label>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Public Serverlar
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Tashqi serverlarni boshqarish va sozlash
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--bg-dark)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi server
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <Input
          placeholder="Serverlarni qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-[var(--bg-card)] border-[var(--border-color)]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : filteredServers.length === 0 ? (
        <Card className="cyber-card border-[var(--border-color)] p-12">
          <div className="text-center">
            <Server className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Serverlar topilmadi
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              {searchQuery
                ? "Qidiruv bo'yicha serverlar topilmadi"
                : "Hozircha public serverlar mavjud emas"}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleCreate}
                className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--bg-dark)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Birinchi serverni qo'shing
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <Card
              key={server.id}
              className="cyber-card border-[var(--border-color)] overflow-hidden hover:border-[var(--primary)]/50 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                      <Server className="w-6 h-6 text-[var(--bg-dark)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {server.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Globe className="w-3 h-3" />
                        {server.ip_address}:{server.port}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(server)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(
                            `minecraft://${server.ip_address}:${server.port}`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Serverga kirish
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(server)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {server.description && (
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                    {server.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(
                        server.status,
                      )}`}
                    >
                      {getStatusIcon(server.status)}
                      {getStatusText(server.status)}
                    </span>
                    {server.whitelist_enabled && (
                      <span className="px-2 py-1 rounded text-xs bg-[var(--secondary)]/20 text-[var(--secondary)]">
                        Whitelist
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <Users className="w-4 h-4" />
                    {server.current_players}/{server.max_players}
                  </div>
                </div>

                {server.minecraft_version && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Minecraft {server.minecraft_version}</span>
                      <span>
                        RAM: {server.min_ram}-{server.max_ram} MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          className="bg-[var(--bg-card)] border-[var(--border-color)] max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              Yangi server qo'shish
            </DialogTitle>
          </DialogHeader>
          {renderForm(false)}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={isSubmitting || !formData.name || !formData.ip_address}
              className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--bg-dark)]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Yaratish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="bg-[var(--bg-card)] border-[var(--border-color)] max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              Serverni tahrirlash
            </DialogTitle>
          </DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={isSubmitting || !formData.name || !formData.ip_address}
              className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--bg-dark)]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Saqlash"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              Serverni o'chirish
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                {selectedServer?.name}
              </span>{" "}
              serverini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "O'chirish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
