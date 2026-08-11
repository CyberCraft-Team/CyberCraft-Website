"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  Trash2,
  Shield,
  Gamepad,
  Server,
  HardDrive,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { minecraftAPI } from "@/lib/api/minecraft";
import type { MinecraftServerDetail } from "@/lib/api/types";

export default function ServerSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: serverId } = use(params);
  const router = useRouter();

  const [server, setServer] = useState<MinecraftServerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    port: 25565,
    min_ram: 1024,
    max_ram: 2048,
    max_players: 20,
    motd: "",
    gamemode: "survival",
    difficulty: "normal",
    pvp: true,
    online_mode: false,
    white_list: false,
    spawn_protection: 16,
    view_distance: 10,
    allow_flight: false,
    allow_nether: true,
    announce_player_achievements: true,
    enable_command_block: false,
    force_gamemode: false,
    generate_structures: true,
    hardcore: false,
    level_type: "minecraft:normal",
    max_build_height: 256,
    max_tick_time: 60000,
    spawn_animals: true,
    spawn_monsters: true,
    spawn_npcs: true,
  });

  useEffect(() => {
    loadServer();
  }, [serverId]);

  const loadServer = async () => {
    setIsLoading(true);
    try {
      const data = await minecraftAPI.getServer(serverId);
      setServer(data);
      setFormData({
        name: data.name || "",
        port: data.port || 25565,
        min_ram: data.min_ram || 1024,
        max_ram: data.max_ram || 2048,
        max_players: data.max_players || 20,
        motd: data.motd || "",
        gamemode: data.gamemode || "survival",
        difficulty: data.difficulty || "normal",
        pvp: data.pvp ?? true,
        online_mode: data.online_mode ?? false,
        white_list: data.white_list ?? false,
        spawn_protection: data.spawn_protection ?? 16,
        view_distance: data.view_distance ?? 10,
        allow_flight: (data as any).allow_flight ?? false,
        allow_nether: (data as any).allow_nether ?? true,
        announce_player_achievements:
          (data as any).announce_player_achievements ?? true,
        enable_command_block: (data as any).enable_command_block ?? false,
        force_gamemode: (data as any).force_gamemode ?? false,
        generate_structures: (data as any).generate_structures ?? true,
        hardcore: (data as any).hardcore ?? false,
        level_type: (data as any).level_type || "minecraft:normal",
        max_build_height: (data as any).max_build_height ?? 256,
        max_tick_time: (data as any).max_tick_time ?? 60000,
        spawn_animals: (data as any).spawn_animals ?? true,
        spawn_monsters: (data as any).spawn_monsters ?? true,
        spawn_npcs: (data as any).spawn_npcs ?? true,
      });
    } catch (error) {
      console.error("Error loading server:", error);
      router.push("/dashboard/minecraft");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await minecraftAPI.updateServer(serverId, formData);
      alert("Sozlamalar saqlandi!");
    } catch (error: any) {
      alert(error.message || "Saqlashda xato");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Serverni o'chirishni tasdiqlaysizmi? Barcha fayllar o'chiriladi!"
      )
    ) {
      try {
        await minecraftAPI.deleteServer(serverId);
        router.push("/dashboard/minecraft");
      } catch (error: any) {
        alert(error.message || "Server o'chirishda xato");
      }
    }
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/minecraft/${serverId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Server sozlamalari
            </h1>
            <p className="text-[var(--text-secondary)]">{server.name}</p>
          </div>
        </div>

        <Button className="cyber-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Saqlash
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-[var(--bg-card)] border border-[var(--border-color)]">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <Server className="w-4 h-4 mr-2" />
            Asosiy
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="gameplay"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <Gamepad className="w-4 h-4 mr-2" />
            Gameplay
          </TabsTrigger>
          <TabsTrigger
            value="world"
            className="data-[state=active]:bg-[var(--primary)]/20"
          >
            <Shield className="w-4 h-4 mr-2" />
            World
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="space-y-6">
            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  Asosiy sozlamalar
                </CardTitle>
                <CardDescription>
                  Server nomi va tarmoq sozlamalari
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Server nomi
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">Port</Label>
                    <Input
                      type="number"
                      value={formData.port}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          port: Number.parseInt(e.target.value),
                        })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    MOTD (Server xabari)
                  </Label>
                  <Input
                    value={formData.motd}
                    onChange={(e) =>
                      setFormData({ ...formData, motd: e.target.value })
                    }
                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
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
                        max_players: Number.parseInt(e.target.value),
                      })
                    }
                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  Xavfsizlik
                </CardTitle>
                <CardDescription>Online mode va whitelist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)]">
                    <div>
                      <Label className="text-[var(--text-primary)]">
                        Online Mode
                      </Label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Mojang autentifikatsiyasi
                      </p>
                    </div>
                    <Switch
                      checked={formData.online_mode}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, online_mode: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-dark)]">
                    <div>
                      <Label className="text-[var(--text-primary)]">
                        Whitelist
                      </Label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Faqat ruxsat berilganlar
                      </p>
                    </div>
                    <Switch
                      checked={formData.white_list}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, white_list: v })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  RAM sozlamalari
                </CardTitle>
                <CardDescription>Server xotira limitlari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  View va Tick sozlamalari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      View Distance (chunks)
                    </Label>
                    <Input
                      type="number"
                      value={formData.view_distance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          view_distance: Number.parseInt(e.target.value),
                        })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                      min={2}
                      max={32}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Max Tick Time (ms)
                    </Label>
                    <Input
                      type="number"
                      value={formData.max_tick_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_tick_time: Number.parseInt(e.target.value),
                        })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gameplay Settings */}
        <TabsContent value="gameplay">
          <div className="space-y-6">
            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  O'yin sozlamalari
                </CardTitle>
                <CardDescription>
                  Gamemode, difficulty va boshqalar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      Hardcore
                    </Label>
                    <Switch
                      checked={formData.hardcore}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, hardcore: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Force Gamemode
                    </Label>
                    <Switch
                      checked={formData.force_gamemode}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, force_gamemode: v })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Allow Flight
                    </Label>
                    <Switch
                      checked={formData.allow_flight}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, allow_flight: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Command Blocks
                    </Label>
                    <Switch
                      checked={formData.enable_command_block}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, enable_command_block: v })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="world">
          <div className="space-y-6">
            <Card className="cyber-card border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  World sozlamalari
                </CardTitle>
                <CardDescription>Dunyo generatsiyasi va spawn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Level Type
                    </Label>
                    <Select
                      value={formData.level_type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, level_type: v })
                      }
                    >
                      <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minecraft:normal">Normal</SelectItem>
                        <SelectItem value="minecraft:flat">Flat</SelectItem>
                        <SelectItem value="minecraft:large_biomes">
                          Large Biomes
                        </SelectItem>
                        <SelectItem value="minecraft:amplified">
                          Amplified
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-secondary)]">
                      Max Build Height
                    </Label>
                    <Input
                      type="number"
                      value={formData.max_build_height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_build_height: Number.parseInt(e.target.value),
                        })
                      }
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    Spawn Protection (blocks)
                  </Label>
                  <Input
                    type="number"
                    value={formData.spawn_protection}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spawn_protection: Number.parseInt(e.target.value),
                      })
                    }
                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Allow Nether
                    </Label>
                    <Switch
                      checked={formData.allow_nether}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, allow_nether: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Generate Structures
                    </Label>
                    <Switch
                      checked={formData.generate_structures}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, generate_structures: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Spawn Animals
                    </Label>
                    <Switch
                      checked={formData.spawn_animals}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, spawn_animals: v })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Spawn Monsters
                    </Label>
                    <Switch
                      checked={formData.spawn_monsters}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, spawn_monsters: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]">
                    <Label className="text-[var(--text-secondary)]">
                      Spawn NPCs
                    </Label>
                    <Switch
                      checked={formData.spawn_npcs}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, spawn_npcs: v })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-400">Xavfli zona</CardTitle>
                <CardDescription>Bu amallar qaytarib bo'lmaydi</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Serverni o'chirish
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
