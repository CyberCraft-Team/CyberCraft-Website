"use client";

import { useCallback } from "react";
import useSWR from "swr";

import { apiFetch, swrFetcher } from "./fetcher";
import type {
  AdminUser,
  CCTransaction,
  DailyBonusStatus,
  LauncherDownloads,
  News,
  Rank,
  ReferralInfo,
  Server,
  SocialLink,
  Stats,
  TopVoter,
  UserMinimal,
  VotingSite,
} from "./types";

/**
 * Data hooks.
 *
 * Every request goes to /api/backend on this app's own origin, where a route
 * handler attaches the session token from the HttpOnly cookie. There are no
 * token helpers here any more: the browser cannot read the credential, which
 * is the point. SWR keys are therefore plain paths rather than
 * [path, token] pairs.
 */

const noFocusRevalidate = { revalidateOnFocus: false } as const;

// ---------------------------------------------------------------------------
// Public data
// ---------------------------------------------------------------------------

export function useServers() {
  const { data, error, isLoading, mutate } = useSWR<Server[]>(
    "public/servers/",
    swrFetcher,
    { refreshInterval: 30000, ...noFocusRevalidate },
  );
  return { servers: data || [], isLoading, isError: error, mutate };
}

export function useStats() {
  const { data, error, isLoading } = useSWR<Stats>("public/stats/", swrFetcher, {
    refreshInterval: 10000,
    ...noFocusRevalidate,
  });
  return { stats: data, isLoading, isError: error };
}

export function useNews() {
  const { data, error, isLoading } = useSWR<News[]>("public/news/", swrFetcher, {
    refreshInterval: 60000,
    ...noFocusRevalidate,
  });
  return { news: data || [], isLoading, isError: error };
}

export function useVotingSites() {
  const { data, error, isLoading } = useSWR<VotingSite[]>(
    "public/voting/sites/",
    swrFetcher,
    noFocusRevalidate,
  );
  return { votingSites: data || [], isLoading, isError: error };
}

export function useSocialLinks() {
  const { data, error, isLoading } = useSWR<SocialLink[]>(
    "public/social-links/",
    swrFetcher,
    noFocusRevalidate,
  );
  return { socialLinks: data || [], isLoading, isError: error };
}

export function useTopVoters() {
  const { data, error, isLoading } = useSWR<TopVoter[]>(
    "public/voting/top/",
    swrFetcher,
    { refreshInterval: 60000, ...noFocusRevalidate },
  );
  return { topVoters: data || [], isLoading, isError: error };
}

export function useLauncherDownloads() {
  const { data, error, isLoading } = useSWR<LauncherDownloads>(
    "launcher/downloads/",
    swrFetcher,
    noFocusRevalidate,
  );
  return { downloads: data, isLoading, isError: error };
}

export function useRanks() {
  const { data, error, isLoading } = useSWR<Rank[]>("rewards/ranks/", swrFetcher, {
    ...noFocusRevalidate,
  });
  return { ranks: data || [], isLoading, isError: error };
}

// ---------------------------------------------------------------------------
// Authentication
//
// The session lives in an HttpOnly cookie, so these hooks ask the server who
// the visitor is rather than reading a token. A 401 simply means "logged
// out" and must not be retried.
// ---------------------------------------------------------------------------

async function meFetcher<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { credentials: "same-origin" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Failed to load session (${response.status})`);
  return response.json();
}

const sessionOptions = {
  ...noFocusRevalidate,
  shouldRetryOnError: false,
} as const;

export function useUserAuth() {
  const { data, error, isLoading, mutate } = useSWR<{ user: UserMinimal } | null>(
    "/api/auth/me",
    meFetcher,
    sessionOptions,
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await postJson<{ user: UserMinimal }>(
        `/api/auth/login${window.location.search}`,
        { username, password },
      );
      await mutate({ user: result.user });
      return result;
    },
    [mutate],
  );

  const googleLogin = useCallback(
    async (idToken: string, username?: string) => {
      const result = await postJson<any>(`/api/auth/google${window.location.search}`, {
        id_token: idToken,
        ...(username ? { username } : {}),
      });
      if (!result.needs_username) await mutate({ user: result.user });
      return result;
    },
    [mutate],
  );

  const telegramLogin = useCallback(
    async (authData: unknown, username?: string) => {
      const result = await postJson<any>(`/api/auth/telegram${window.location.search}`, {
        auth_data: authData,
        ...(username ? { username } : {}),
      });
      if (!result.needs_username) await mutate({ user: result.user });
      return result;
    },
    [mutate],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    await mutate(null);
  }, [mutate]);

  const refreshUser = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    user: data?.user ?? null,
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
  const { data, error, isLoading, mutate } = useSWR<{ user: AdminUser } | null>(
    "/api/auth/admin/me",
    meFetcher,
    sessionOptions,
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await postJson<{ user: AdminUser }>("/api/auth/admin/login", {
        username,
        password,
      });
      await mutate({ user: result.user });
      return result;
    },
    [mutate],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    await mutate(null);
  }, [mutate]);

  return {
    user: data?.user ?? null,
    isLoading,
    isError: error,
    isAuthenticated: !!data?.user,
    isAdmin: data?.user?.is_staff || false,
    login,
    logout,
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (payload && (payload.error || payload.detail)) || "So'rov bajarilmadi",
    );
  }
  return payload as T;
}

// ---------------------------------------------------------------------------
// Authenticated data
// ---------------------------------------------------------------------------

export function useDailyBonusStatus() {
  const { data, error, isLoading, mutate } = useSWR<DailyBonusStatus>(
    "rewards/daily-bonus/status/",
    swrFetcher,
    sessionOptions,
  );
  const claimBonus = useCallback(async () => {
    const result = await apiFetch<any>("rewards/daily-bonus/", { method: "POST" });
    await mutate();
    return result;
  }, [mutate]);

  return { bonusStatus: data, isLoading, isError: error, mutate, claimBonus };
}

export function useReferralInfo() {
  const { data, error, isLoading } = useSWR<ReferralInfo>(
    "rewards/referral/",
    swrFetcher,
    sessionOptions,
  );
  return { referralInfo: data, isLoading, isError: error };
}

export function useCCTransactions() {
  const { data, error, isLoading, mutate } = useSWR<CCTransaction[]>(
    "rewards/transactions/",
    swrFetcher,
    sessionOptions,
  );
  return { transactions: data || [], isLoading, isError: error, mutate };
}

export function useAdminNews() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    "admin/news/",
    swrFetcher,
    { refreshInterval: 30000, ...sessionOptions },
  );
  return { news: data?.results || data || [], isLoading, isError: error, mutate };
}

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    "admin/users/",
    swrFetcher,
    sessionOptions,
  );
  return { users: data?.results || data || [], isLoading, isError: error, mutate };
}

export function useAdminPublicServers() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    "admin/servers/",
    swrFetcher,
    sessionOptions,
  );
  return {
    servers: data?.results || data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
