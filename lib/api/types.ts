export interface User {
  id: number;
  username: string;
  email: string;
  minecraft_uuid: string | null;
  skin_face_url: string | null;
  is_whitelisted: boolean;
  is_operator: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_banned: boolean;
  ban_reason: string;
  banned_until: string | null;
  is_email_verified: boolean;
  cc_balance: number;
  rank: string;
  referral_code: string | null;
  last_login: string | null;
  created_at: string;
}

export interface UserMinimal {
  id: number;
  username: string;
  email?: string;
  skin_url?: string | null;
  skin_face_url?: string | null;
  cape_url?: string | null;
  is_whitelisted: boolean;
  is_operator: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  cc_balance?: number;
  rank?: string;
  referral_code?: string;
  is_email_verified?: boolean;
}

export interface Modpack {
  id: number;
  name: string;
  slug: string;
  version: string;
  minecraft_version: string;
  forge_version: string | null;
  fabric_version: string | null;
  description: string;
}

export interface ModpackFile {
  relative_path: string;
  file_type: "mod" | "config" | "resource" | "shader" | "other";
  sha256_hash: string;
  file_size: number;
  url: string | null;
  is_required: boolean;
}

export interface Server {
  id: number;
  name: string;
  slug: string;
  ip_address: string;
  port: number;
  status: "online" | "offline" | "maintenance";
  current_players: number;
  max_players: number;
  description: string;
  icon_url: string | null;
  modpack_name: string | null;
  modpack_version: string | null;
  minecraft_version: string | null;
  whitelist_enabled: boolean;
  min_ram: number;
  max_ram: number;
}

export interface ServerManifest extends Omit<
  Server,
  | "current_players"
  | "max_players"
  | "status"
  | "icon_url"
  | "description"
  | "modpack_name"
  | "modpack_version"
  | "minecraft_version"
  | "whitelist_enabled"
> {
  modpack: Modpack | null;
  java_args: string;
  files: ModpackFile[];
}

export interface News {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  category_color: string;
  image_url: string | null;
  author: string;
}

export interface VotingSite {
  id: number;
  name: string;
  url: string;
  bonus: number;
}

export interface TopVoter {
  rank: number;
  username: string;
  votes: number;
  avatar_url: string | null;
}

export interface Stats {
  online_players: number;
  max_online: number;
  total_registered: number;
  active_servers: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserMinimal;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_whitelisted: boolean;
  is_operator: boolean;
  created_at: string;
}

export interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}

export interface ApiError {
  error: string;
}

export interface MinecraftServer {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  server_type: string;
  server_type_display?: string;
  minecraft_version: string;
  server_jar: string;
  server_jar_name: string;
  port: number;
  min_ram: number;
  max_ram: number;
  max_players: number;
  motd: string;
  gamemode: string;
  difficulty: string;
  pvp: boolean;
  online_mode: boolean;
  white_list: boolean;
  spawn_protection: number;
  view_distance: number;
  status:
    | "stopped"
    | "starting"
    | "running"
    | "stopping"
    | "installing"
    | "error";
  current_players: number;
  pid: number | null;
  server_path: string;
  mods_count: number;
  is_installed: boolean;
  created_at: string;
  updated_at: string;
  last_started: string | null;
  icon_url: string | null;
  background_image_url: string | null;
  gallery_images: { id: number; image_url: string; caption: string }[];
}

export interface MinecraftServerDetail extends MinecraftServer {
  mods: ServerMod[];
  status_info: {
    id: string;
    name: string;
    status: string;
    is_running: boolean;
    pid: number | null;
    current_players: number;
    max_players: number;
    minecraft_version: string;
    server_type: string;
    port: number;
    ram: {
      min: number;
      max: number;
    };
    is_installed: boolean;
    icon_url: string | null;
    background_image_url: string | null;
    online_player_list?: string[];
  };
}

export interface ServerMod {
  id: number;
  name: string;
  file_name: string;
  version: string;
  description: string;
  file_size: number;
  status: "enabled" | "disabled";
  uploaded_at: string;
}

export interface ServerLog {
  id: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
}

export interface ServerFile {
  name: string;
  path: string;
  is_directory: boolean;
  size: number;
  modified: string;
}

export interface MinecraftVersion {
  id: string;
  type: string;
  url?: string;
}

export interface CreateServerRequest {
  name: string;
  slug: string;
  server_jar: string;
  server_type?: string;
  loader_version?: string | null;
  minecraft_version?: string;
  port: number;
  min_ram: number;
  max_ram: number;
  max_players: number;
  motd: string;
  gamemode: string;
  difficulty: string;
  pvp: boolean;
  online_mode: boolean;
  white_list: boolean;
  spawn_protection?: number;
  view_distance?: number;
}

export interface ServerJar {
  id: string;
  name: string;
  server_type: string;
  server_type_display?: string;
  minecraft_version: string;
  file_size: number;
  is_default: boolean;
}

export interface ServerTypeConfig {
  server_type: string;
  display_name: string;
  description: string;
  is_installer: boolean;
  jar_file_name: string;
  is_active: boolean;
}

export interface ServerTypeConfigDetail extends ServerTypeConfig {
  install_command: string;
  run_command: string;
  requires_args_file: boolean;
  args_file_pattern: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServerTypeConfigRequest {
  server_type: string;
  display_name: string;
  description?: string;
  is_installer: boolean;
  install_command?: string;
  run_command: string;
  requires_args_file?: boolean;
  args_file_pattern?: string;
  jar_file_name?: string;
  is_active?: boolean;
}

export interface Rank {
  id: number;
  name: string;
  price: number;
  color_code: string;
  priority: number;
}

export interface DailyBonusStatus {
  streak: number;
  last_claim: string | null;
  can_claim: boolean;
  next_bonus: number;
}

export interface DailyBonusClaimResponse {
  message: string;
  amount: number;
  streak: number;
  new_balance: number;
}

export interface ReferralInfo {
  referral_code: string;
  referral_link: string;
  referral_count: number;
  bonus_per_invite: number;
  bonus_for_invitee: number;
}

export interface CCTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  transaction_type_display: string;
  description: string;
  created_at: string;
}

export interface RankPurchaseResponse {
  message: string;
  rank: string;
  new_balance: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: "info" | "success" | "warning" | "reward" | "system";
  is_read: boolean;
  created_at: string;
}

export interface NotificationUnreadCount {
  unread_count: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  is_active: boolean;
  order: number;
}
