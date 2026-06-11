"use client";

import useSWR from "swr";
import apiClient from "./client";
import type {
  Server,
  Stats,
  News,
  VotingSite,
  TopVoter,
  AdminUser,
  ServerJar,
  UserMinimal,
  Rank,
  DailyBonusStatus,
  ReferralInfo,
  CCTransaction,
  DailyBonusClaimResponse,
  RankPurchaseResponse,
  SocialLink,
} from "./types";

const USER_TOKEN_KEY = "cybercraft_user_token";
const ADMIN_TOKEN_KEY = "cybercraft_admin_token";

function setCookie(name: string, value: string, days = 30): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token: string): void {
  localStorage.setItem(USER_TOKEN_KEY, token);
  setCookie(USER_TOKEN_KEY, token);
}

export function removeUserToken(): void {
  localStorage.removeItem(USER_TOKEN_KEY);
  removeCookie(USER_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  setCookie(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  removeCookie(ADMIN_TOKEN_KEY);
}

const publicFetcher = async (endpoint: string): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const fullUrl = `${apiUrl}${endpoint}`;

  const response = await fetch(fullUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  return response.json();
};

export function useServers() {
  const { data, error, isLoading, mutate } = useSWR<Server[]>(
    "/public/servers/",
    publicFetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    },
  );

  return {
    servers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStats() {
  const { data, error, isLoading } = useSWR<Stats>(
    "/public/stats/",
    publicFetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    },
  );

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}

export function useNews() {
  const { data, error, isLoading } = useSWR<News[]>(
    "/public/news/",
    publicFetcher,
    {
      refreshInterval: 60000,
    },
  );

  return {
    news: data || [],
    isLoading,
    isError: error,
  };
}

export function useVotingSites() {
  const { data, error, isLoading } = useSWR<VotingSite[]>(
    "/public/voting/sites/",
    publicFetcher,
  );

  return {
    votingSites: data || [],
    isLoading,
    isError: error,
  };
}

export function useSocialLinks() {
  const { data, error, isLoading } = useSWR<SocialLink[]>(
    "/public/social-links/",
    publicFetcher,
  );

  return {
    socialLinks: data || [],
    isLoading,
    isError: error,
  };
}

export function useTopVoters() {
  const { data, error, isLoading } = useSWR<TopVoter[]>(
    "/public/voting/top/",
    publicFetcher,
    {
      refreshInterval: 60000,
    },
  );

  return {
    topVoters: data || [],
    isLoading,
    isError: error,
  };
}

export function useServerJars() {
  const token = getAdminToken();
  const { data, error, isLoading } = useSWR<ServerJar[]>(
    token ? ["/minecraft/jars/", token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/minecraft/jars/?active_only=true`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    serverJars: data || [],
    isLoading,
    isError: error,
  };
}

export function useUserAuth() {
  const token = getUserToken();

  const { data, error, isLoading, mutate } = useSWR<{ user: UserMinimal }>(
    token ? ["/auth/launcher/me/", token] : null,
    ([, authToken]) => apiClient.getUserMe(authToken as string),
    {
      revalidateOnFocus: false,
    },
  );

  const login = async (username: string, password: string) => {
    const response = await apiClient.userLogin(username, password);
    setUserToken(response.token);
    mutate({ user: response.user });
    return response;
  };

  const googleLogin = async (idToken: string, username?: string) => {
    const response = await apiClient.googleLogin(idToken, username);
    if (!response.needs_username) {
      setUserToken(response.token);
      mutate({ user: response.user });
    }
    return response;
  };

  const telegramLogin = async (authData: any) => {
    const response = await apiClient.telegramLogin(authData);
    setUserToken(response.token);
    mutate({ user: response.user });
    return response;
  };

  const logout = async () => {
    const currentToken = getUserToken();
    if (currentToken) {
      try {
        await apiClient.userLogout(currentToken);
      } catch (e) {}
    }
    removeUserToken();
    mutate(undefined);
  };

  const refreshUser = async () => {
    const currentToken = getUserToken();
    if (currentToken) {
      await mutate();
    }
  };

  return {
    user: data?.user || null,
    token,
    isLoading,
    isError: error,
    isAuthenticated: !!data?.user,
    login,
    googleLogin,
    telegramLogin,
    logout,
    refreshUser,
  };
}

export function useAdminAuth() {
  const token = getAdminToken();

  const { data, error, isLoading, mutate } = useSWR<{ user: AdminUser }>(
    token ? ["/auth/admin/me/", token] : null,
    ([, authToken]) => apiClient.getAdminMe(authToken as string),
    {
      revalidateOnFocus: false,
    },
  );

  const login = async (username: string, password: string) => {
    const response = await apiClient.adminLogin(username, password);
    setAdminToken(response.token);
    mutate({ user: response.user });
    return response;
  };

  const logout = async () => {
    const currentToken = getAdminToken();
    if (currentToken) {
      try {
        await apiClient.adminLogout(currentToken);
      } catch (e) {}
    }
    removeAdminToken();
    mutate(undefined);
  };

  return {
    user: data?.user || null,
    isLoading,
    isError: error,
    isAuthenticated: !!data?.user,
    isAdmin: data?.user?.is_staff || false,
    login,
    logout,
  };
}

export function useAdminServers() {
  const token = getAdminToken();
  const { data, error, isLoading, mutate } = useSWR<
    import("./types").MinecraftServer[]
  >(
    token ? ["/minecraft/servers/", token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/minecraft/servers/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      refreshInterval: 10000,
    },
  );

  return {
    servers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAdminServer(serverId: string) {
  const token = getAdminToken();
  const { data, error, isLoading, mutate } = useSWR<
    import("./types").MinecraftServerDetail
  >(
    token && serverId ? [`/minecraft/servers/${serverId}/`, token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/minecraft/servers/${serverId}/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      refreshInterval: 5000,
    },
  );

  return {
    server: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAdminNews() {
  const token = getAdminToken();
  const { data, error, isLoading, mutate } = useSWR<any>(
    token ? ["/admin/news/", token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/news/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
    },
  );

  const news: import("./types").News[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return {
    news,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAdminUsers() {
  const token = getAdminToken();
  const { data, error, isLoading, mutate } = useSWR<any>(
    token ? ["/admin/users/", token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/users/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
    },
  );

  const users: import("./types").User[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return {
    users,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAdminVotingSites() {
  const token = getAdminToken();
  const { data, error, isLoading, mutate } = useSWR<any>(
    token ? ["/admin/voting/sites/", token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/voting/sites/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
    },
  );

  const votingSites: import("./types").VotingSite[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return {
    votingSites,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAdminPublicServers() {
  const token = getAdminToken();
  const { data, error, isLoading, mutate } = useSWR<any>(
    token ? ["/admin/servers/", token] : null,
    ([, authToken]) =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/servers/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      ).then((res) => res.json()),
    {
      revalidateOnFocus: false,
    },
  );

  const servers: import("./types").Server[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return {
    servers,
    isLoading,
    isError: error,
    mutate,
  };
}

// Rewards Hooks
export function useRanks() {
  const { data, error, isLoading } = useSWR<any>(
    "/rewards/ranks/",
    publicFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const ranks: Rank[] = Array.isArray(data) ? data : data?.results || [];

  return {
    ranks,
    isLoading,
    isError: error,
  };
}

export function useDailyBonusStatus() {
  const token = getUserToken();
  const { data, error, isLoading, mutate } = useSWR<DailyBonusStatus>(
    token ? ["/rewards/daily-bonus/status/", token] : null,
    ([, authToken]) => apiClient.getDailyBonusStatus(authToken as string),
    {
      revalidateOnFocus: false,
    },
  );

  const claimBonus = async () => {
    const currentToken = getUserToken();
    if (!currentToken) throw new Error("Not authenticated");
    const result = await apiClient.claimDailyBonus(currentToken);
    mutate();
    return result;
  };

  return {
    bonusStatus: data,
    isLoading,
    isError: error,
    claimBonus,
    mutate,
  };
}

export function useReferralInfo() {
  const token = getUserToken();
  const { data, error, isLoading } = useSWR<ReferralInfo>(
    token ? ["/rewards/referral/", token] : null,
    ([, authToken]) => apiClient.getReferralInfo(authToken as string),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    referralInfo: data,
    isLoading,
    isError: error,
  };
}

export function useCCTransactions() {
  const token = getUserToken();
  const { data, error, isLoading } = useSWR<CCTransaction[]>(
    token ? ["/rewards/transactions/", token] : null,
    ([, authToken]) => apiClient.getCCTransactions(authToken as string),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    transactions: data || [],
    isLoading,
    isError: error,
  };
}
