import { getAdminToken } from "./hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (() => {
    try {
      const url = new URL(API_BASE_URL);
      const wsProto = url.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProto}//${url.host}`;
    } catch {
      return typeof window !== "undefined"
        ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`
        : "ws://localhost:8000";
    }
  })();

const isApiAvailable = () => {
  return true;
};

const DEFAULT_SERVER_TYPES = [
  {
    server_type: "vanilla",
    display_name: "Vanilla",
    description: "Minecraft vanilla server - hech qanday modifikatsiyasiz",
    is_active: true,
  },
  {
    server_type: "paper",
    display_name: "Paper",
    description:
      "Yuqori unumdorlikdagi Spigot fork, plugin qo'llab-quvvatlashi bilan",
    is_active: true,
  },
  {
    server_type: "spigot",
    display_name: "Spigot",
    description: "Plugin qo'llab-quvvatlashi bilan CraftBukkit fork",
    is_active: true,
  },
  {
    server_type: "purpur",
    display_name: "Purpur",
    description: "Paper fork ko'proq konfiguratsiya imkoniyatlari bilan",
    is_active: true,
  },
  {
    server_type: "fabric",
    display_name: "Fabric",
    description: "Zamonaviy yengil modloader",
    is_active: true,
  },
  {
    server_type: "forge",
    display_name: "Forge",
    description: "Mashhur mod loader - katta mod kutubxonasi",
    is_active: true,
  },
  {
    server_type: "neoforge",
    display_name: "NeoForge",
    description: "Forge ning yangilangan forki",
    is_active: true,
  },
];

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!isApiAvailable()) {
    if (endpoint.includes("/mods")) return [] as T;
    if (endpoint.includes("/files")) return [] as T;
    if (endpoint.includes("/server-types")) return [] as T;
    if (
      endpoint.includes("/servers/") &&
      !endpoint.includes("/mods") &&
      !endpoint.includes("/files")
    ) {
      const serverId = endpoint.split("/servers/")[1]?.split("/")[0];
      return {
        id: serverId,
        name: "Demo Server",
        status: "stopped",
        server_type: "vanilla",
        minecraft_version: "1.20.4",
        max_players: 20,
        port: 25565,
        memory: 2048,
        created_at: new Date().toISOString(),
        online_players: 0,
      } as T;
    }
    if (endpoint.includes("/servers")) return [] as T;
    return {} as T;
  }

  const token = getAdminToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    console.warn(`API not reachable: ${endpoint}`);
    if (endpoint.includes("/mods")) return [] as T;
    if (endpoint.includes("/files")) return [] as T;
    if (endpoint.includes("/servers")) return [] as T;
    return {} as T;
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));

    if (typeof error === "object" && !error.error && !error.detail) {
      const errorMessages = Object.entries(error)
        .map(([key, value]) => {
          if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
          return `${key}: ${value}`;
        })
        .join("; ");
      throw new Error(
        errorMessages || `HTTP error! status: ${response.status}`,
      );
    }

    throw new Error(
      error.error || error.detail || `HTTP error! status: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const minecraftAPI = {
  getServerTypes: (activeOnly = true) =>
    fetchWithAuth<import("./types").ServerTypeConfig[]>(
      `/minecraft/server-types/?active_only=${activeOnly}`,
    ),

  getServerType: (serverType: string) =>
    fetchWithAuth<import("./types").ServerTypeConfigDetail>(
      `/minecraft/server-types/${serverType}/`,
    ),

  createServerType: (data: import("./types").CreateServerTypeConfigRequest) =>
    fetchWithAuth<import("./types").ServerTypeConfigDetail>(
      "/minecraft/server-types/",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  updateServerType: (
    serverType: string,
    data: Partial<import("./types").CreateServerTypeConfigRequest>,
  ) =>
    fetchWithAuth<import("./types").ServerTypeConfigDetail>(
      `/minecraft/server-types/${serverType}/`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),

  deleteServerType: (serverType: string) =>
    fetchWithAuth<void>(`/minecraft/server-types/${serverType}/`, {
      method: "DELETE",
    }),

  getServerJars: () =>
    fetchWithAuth<import("./types").ServerJar[]>("/minecraft/jars/"),

  uploadServerJar: async (
    file: File,
    data: {
      name: string;
      server_type: string;
      minecraft_version: string;
      is_default?: boolean;
    },
    onProgress?: (percent: number) => void,
  ) => {
    const token = getAdminToken();

    if (!token) {
      throw new Error("Avtorizatsiya tokeni topilmadi");
    }

    console.log(
      "[v0] uploadServerJar - Sending request to:",
      `${API_BASE_URL}/minecraft/jars/`,
    );
    console.log("[v0] uploadServerJar - File:", file.name, file.size);
    console.log("[v0] uploadServerJar - Data:", data);

    const formData = new FormData();
    formData.append("jar_file", file);
    formData.append("name", data.name);
    formData.append("server_type", data.server_type);
    formData.append("minecraft_version", data.minecraft_version);
    if (data.is_default !== undefined) {
      formData.append("is_default", String(data.is_default));
    }

    const responsePayload = await new Promise<{
      status: number;
      ok: boolean;
      text: string;
    }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/minecraft/jars/`);
      xhr.setRequestHeader("Authorization", `Token ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        };
      }

      xhr.onload = () => {
        resolve({
          status: xhr.status,
          ok: xhr.status >= 200 && xhr.status < 300,
          text: xhr.responseText || "",
        });
      };
      xhr.onerror = () => reject(new Error("Tarmoq xatosi"));
      xhr.send(formData);
    });

    console.log(
      "[v0] uploadServerJar - Response status:",
      responsePayload.status,
    );

    if (!responsePayload.ok) {
      const errorText = responsePayload.text;
      console.log("[v0] uploadServerJar - Error response:", errorText);
      let error: any = {};

      try {
        error = JSON.parse(errorText);
      } catch {
        throw new Error(errorText || `HTTP ${responsePayload.status}`);
      }

      if (typeof error === "object" && !error.error && !error.detail) {
        const errorMessages = Object.entries(error)
          .map(([key, value]) => {
            if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
            return `${key}: ${value}`;
          })
          .join("; ");
        throw new Error(errorMessages || "JAR yuklashda xato");
      }

      throw new Error(error.error || error.detail || "JAR yuklashda xato");
    }

    const result = JSON.parse(responsePayload.text);
    console.log("[v0] uploadServerJar - Success response:", result);
    return result as import("./types").ServerJar;
  },

  createServerWithArchive: async (
    data: import("./types").CreateServerRequest & {
      server_type?: string;
      minecraft_version?: string;
    },
    archive: File,
    onProgress?: (percent: number) => void,
  ) => {
    const token = getAdminToken();
    if (!token) {
      throw new Error("Avtorizatsiya tokeni topilmadi");
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("server_zip", archive);
    formData.append("server_type", data.server_type ?? "custom");
    if (data.minecraft_version) {
      formData.append("minecraft_version", data.minecraft_version);
    }
    if (data.loader_version) {
      formData.append("loader_version", data.loader_version);
    }
    formData.append("port", String(data.port));
    formData.append("min_ram", String(data.min_ram));
    formData.append("max_ram", String(data.max_ram));
    formData.append("max_players", String(data.max_players));
    formData.append("motd", data.motd);
    formData.append("gamemode", data.gamemode);
    formData.append("difficulty", data.difficulty);
    formData.append("pvp", String(data.pvp));
    formData.append("online_mode", String(data.online_mode));
    formData.append("white_list", String(data.white_list));
    if (data.spawn_protection != null) {
      formData.append("spawn_protection", String(data.spawn_protection));
    }
    if (data.view_distance != null) {
      formData.append("view_distance", String(data.view_distance));
    }

    return new Promise<import("./types").MinecraftServerDetail>(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE_URL}/minecraft/servers/`);
        xhr.setRequestHeader("Authorization", `Token ${token}`);

        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          };
        }

        xhr.onload = () => {
          const responseText = xhr.responseText || "{}";
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(responseText));
            return;
          }
          try {
            const parsed = JSON.parse(responseText);
            const message =
              parsed.error ||
              parsed.detail ||
              Object.entries(parsed)
                .map(([key, value]) =>
                  Array.isArray(value)
                    ? `${key}: ${value.join(", ")}`
                    : `${key}: ${value}`,
                )
                .join("; ");
            reject(new Error(message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(responseText || `HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Tarmoq xatosi"));
        xhr.send(formData);
      },
    );
  },

  deleteServerJar: (jarId: string) =>
    fetchWithAuth<void>(`/minecraft/jars/${jarId}/`, {
      method: "DELETE",
    }),

  getServers: () =>
    fetchWithAuth<import("./types").MinecraftServer[]>("/minecraft/servers/"),
  getServer: (serverId: string) =>
    fetchWithAuth<import("./types").MinecraftServerDetail>(
      `/minecraft/servers/${serverId}/`,
    ),

  createServer: (data: import("./types").CreateServerRequest) =>
    fetchWithAuth<import("./types").MinecraftServerDetail>(
      "/minecraft/servers/",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  updateServer: (
    serverId: string,
    data: Partial<import("./types").CreateServerRequest>,
  ) =>
    fetchWithAuth<import("./types").MinecraftServerDetail>(
      `/minecraft/servers/${serverId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),

  deleteServer: (serverId: string) =>
    fetchWithAuth<void>(`/minecraft/servers/${serverId}/`, {
      method: "DELETE",
    }),

  startServer: (serverId: string) =>
    fetchWithAuth<{ message: string }>(
      `/minecraft/servers/${serverId}/start/`,
      {
        method: "POST",
      },
    ),

  stopServer: (serverId: string) =>
    fetchWithAuth<{ message: string }>(`/minecraft/servers/${serverId}/stop/`, {
      method: "POST",
    }),

  restartServer: (serverId: string) =>
    fetchWithAuth<{ message: string }>(
      `/minecraft/servers/${serverId}/restart/`,
      {
        method: "POST",
      },
    ),

  killServer: (serverId: string) =>
    fetchWithAuth<{ message: string }>(`/minecraft/servers/${serverId}/kill/`, {
      method: "POST",
    }),

  installServer: (serverId: string) =>
    fetchWithAuth<{ message: string }>(
      `/minecraft/servers/${serverId}/install/`,
      {
        method: "POST",
      },
    ),

  sendCommand: (serverId: string, command: string) =>
    fetchWithAuth<{ message: string }>(
      `/minecraft/servers/${serverId}/command/`,
      {
        method: "POST",
        body: JSON.stringify({ command }),
      },
    ),

  getLogs: (serverId: string, limit = 100, sinceId?: number) =>
    fetchWithAuth<import("./types").ServerLog[]>(
      `/minecraft/servers/${serverId}/logs/?limit=${limit}${sinceId ? `&since_id=${sinceId}` : ""}`,
    ),

  getMods: (serverId: string) =>
    fetchWithAuth<import("./types").ServerMod[]>(
      `/minecraft/servers/${serverId}/mods/`,
    ),

  uploadMod: async (
    serverId: string,
    file: File,
    name?: string,
    version?: string,
    description?: string,
  ) => {
    const token = getAdminToken();
    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);
    if (version) formData.append("version", version);
    if (description) formData.append("description", description);

    const response = await fetch(
      `${API_BASE_URL}/minecraft/servers/${serverId}/mods/`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to upload mod");
    }

    return response.json() as Promise<import("./types").ServerMod>;
  },

  toggleMod: (
    serverId: string,
    modId: number,
    status: "enabled" | "disabled",
  ) =>
    fetchWithAuth<import("./types").ServerMod>(
      `/minecraft/servers/${serverId}/mods/${modId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    ),

  deleteMod: (serverId: string, modId: number) =>
    fetchWithAuth<void>(`/minecraft/servers/${serverId}/mods/${modId}/`, {
      method: "DELETE",
    }),

  getFiles: (serverId: string, path = "") =>
    fetchWithAuth<import("./types").ServerFile[]>(
      `/minecraft/servers/${serverId}/files/?path=${encodeURIComponent(path)}`,
    ),

  getFileContent: (serverId: string, path: string) =>
    fetchWithAuth<{ content: string }>(
      `/minecraft/servers/${serverId}/files/?path=${encodeURIComponent(
        path,
      )}&content=true`,
    ),

  saveFile: (serverId: string, path: string, content: string) =>
    fetchWithAuth<{ message: string }>(
      `/minecraft/servers/${serverId}/files/`,
      {
        method: "POST",
        body: JSON.stringify({ path, content }),
      },
    ),
  
  uploadServerImages: async (
    serverId: string,
    icon?: File,
    background?: File
  ) => {
    const token = getAdminToken();
    const formData = new FormData();
    if (icon) formData.append("icon", icon);
    if (background) formData.append("background_image", background);

    const response = await fetch(
      `${API_BASE_URL}/minecraft/servers/${serverId}/images/`,
      {
        method: "PATCH",
        headers: {
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || error.detail || "Rasm yuklashda xato");
    }

    return response.json() as Promise<import("./types").MinecraftServerDetail>;
  },

  uploadGalleryImage: async (serverId: string, file: File) => {
    const token = getAdminToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_BASE_URL}/minecraft/servers/${serverId}/gallery/`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || error.detail || "Galereya rasm yuklashda xato");
    }

    return response.json();
  },

  deleteGalleryImage: (serverId: string, imageId: number) =>
    fetchWithAuth<void>(`/minecraft/servers/${serverId}/gallery/${imageId}/`, {
      method: "DELETE",
    }),

  getPlayers: (serverId: string) =>
    fetchWithAuth<{
      whitelist: { name: string; uuid: string }[];
      ops: { name: string; uuid: string; level: number; bypassesPlayerLimit: boolean }[];
      banned: { name: string; uuid: string; created: string; source: string; expires: string; reason: string }[];
    }>(`/minecraft/servers/${serverId}/players/`),

  updatePlayers: (
    serverId: string,
    data: {
      list_type: "whitelist" | "ops" | "banned";
      action: "add" | "remove";
      username: string;
      reason?: string;
    },
  ) =>
    fetchWithAuth<{ message: string }>(
      `/minecraft/servers/${serverId}/players/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),
};

export class ServerConsole {
  private ws: WebSocket | null = null;
  private serverId: string;
  private onLog: (log: import("./types").ServerLog) => void;
  private onStatus: (status: string) => void;
  private onError: (error: string) => void;
  private onInitialLogs?: (logs: import("./types").ServerLog[]) => void;
  private onStats?: (stats: { cpu: number; memory: number; timestamp: string }) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isWebSocketAvailable = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastLogId = 0;

  constructor(
    serverId: string,
    callbacks: {
      onLog: (log: import("./types").ServerLog) => void;
      onStatus: (status: string) => void;
      onError: (error: string) => void;
      onInitialLogs?: (logs: import("./types").ServerLog[]) => void;
      onStats?: (stats: { cpu: number; memory: number; timestamp: string }) => void;
    },
  ) {
    this.serverId = serverId;
    this.onLog = callbacks.onLog;
    this.onStatus = callbacks.onStatus;
    this.onError = callbacks.onError;
    this.onInitialLogs = callbacks.onInitialLogs;
    this.onStats = callbacks.onStats;
    this.connect();
  }

  private connect() {
    const wsUrl = WS_BASE_URL;
    const token = getAdminToken();

    if (!wsUrl || !token) {
      this.isWebSocketAvailable = false;
      this.startPolling();
      return;
    }

    const fullWsUrl = `${wsUrl}/ws/server/${this.serverId}/console/?token=${token}`;

    try {
      this.ws = new WebSocket(fullWsUrl);
      this.isWebSocketAvailable = true;
    } catch {
      this.isWebSocketAvailable = false;
      this.startPolling();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.stopPolling();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "initial_logs":
          if (this.onInitialLogs) {
            this.onInitialLogs(data.logs);
            if (data.logs.length > 0) {
              this.lastLogId = Math.max(
                ...data.logs.map((l: any) => l.id || 0),
              );
            }
          }
          break;
        case "log":
          this.onLog(data.log);
          if (data.log.id) {
            this.lastLogId = Math.max(this.lastLogId, data.log.id);
          }
          break;
        case "status":
        case "server_status":
          this.onStatus(data.status);
          break;
        case "stats":
        case "server_stats":
          if (this.onStats) {
            this.onStats(data.stats);
          }
          break;
        case "error":
          this.onError(data.message);
          break;
      }
    };

    this.ws.onerror = () => {
      this.isWebSocketAvailable = false;
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = 2000 * this.reconnectAttempts;
        setTimeout(() => this.connect(), delay);
      } else {
        this.startPolling();
      }
    };
  }

  private startPolling() {
    if (this.pollingInterval) return;

    this.loadInitialLogs();

    this.pollingInterval = setInterval(() => {
      this.pollLogs();
    }, 2000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async loadInitialLogs() {
    try {
      const logs = await minecraftAPI.getLogs(this.serverId, 100);
      if (this.onInitialLogs) {
        this.onInitialLogs(logs);
      }
      if (logs.length > 0) {
        this.lastLogId = Math.max(...logs.map((l) => l.id || 0));
      }
    } catch {}
  }

  private async pollLogs() {
    try {
      const logs = await minecraftAPI.getLogs(
        this.serverId,
        50,
        this.lastLogId > 0 ? this.lastLogId : undefined,
      );

      for (const log of logs) {
        this.onLog(log);
        if (log.id) {
          this.lastLogId = Math.max(this.lastLogId, log.id);
        }
      }
    } catch (e) {}
  }

  sendCommand(command: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "command", command }));
    } else {
      minecraftAPI.sendCommand(this.serverId, command).catch((e) => {
        this.onError(e.message || "Command yuborishda xato");
      });
    }
  }

  sendAction(action: "start" | "stop" | "restart") {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "action", action }));
    }
  }

  disconnect() {
    this.maxReconnectAttempts = 0;
    this.stopPolling();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
