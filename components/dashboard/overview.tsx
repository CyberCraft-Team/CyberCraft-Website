"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/fetcher";
import type { MinecraftServer, Stats } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuditEntry {
  id: number;
  username: string | null;
  action: string;
  description: string;
  created_at: string;
}
const actionKeys = [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "ban",
  "unban",
  "rank_change",
  "cc_adjust",
  "other",
] as const;

function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="min-w-0 border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="text-muted-foreground">{icon}</div>
      <h3 className="font-medium">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [query, setQuery] = useState("");
  const onSuccess = () => setUpdatedAt(new Date());
  const options = { revalidateOnFocus: false, onSuccess };
  const stats = useSWR<Stats>("public/stats/", apiFetch, {
    ...options,
    refreshInterval: 30000,
  });
  const managed = useSWR<MinecraftServer[]>("minecraft/servers/", apiFetch, {
    ...options,
    refreshInterval: 30000,
  });
  const activity = useSWR<AuditEntry[]>("admin/activity/", apiFetch, {
    ...options,
    refreshInterval: 60000,
  });
  const servers = managed.data ?? [];
  const filtered = servers.filter((s) =>
    s.name
      .toLocaleLowerCase(locale)
      .includes(query.trim().toLocaleLowerCase(locale)),
  );
  const running = servers.filter((s) => s.status === "running");
  const issues = servers.filter((s) => s.status === "error");
  const stopped = servers.filter((s) => s.status === "stopped");
  const onlinePlayers = running.reduce((n, s) => n + s.current_players, 0);
  const capacity = servers.reduce((n, s) => n + s.max_players, 0);
  const formatNumber = (n: number) => new Intl.NumberFormat(locale).format(n);
  const formatDate = (value: string | Date) =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  const createLink = (
    <Button asChild className="min-h-11">
      <Link href="/dashboard/minecraft?create=1">
        <Plus className="mr-2 size-4" />
        {t("createServer")}
      </Link>
    </Button>
  );
  const cards = [
    {
      label: t("onlinePlayers"),
      value: onlinePlayers,
      hint: t("onlineHint"),
      icon: Users,
      loading: managed.isLoading,
      error: managed.error,
    },
    {
      label: t("runningServers"),
      value: running.length,
      hint: t("serversHint", { count: servers.length }),
      icon: Server,
      loading: managed.isLoading,
      error: managed.error,
    },
    {
      label: t("capacity"),
      value: capacity,
      hint: t("capacityHint"),
      icon: Activity,
      loading: managed.isLoading,
      error: managed.error,
    },
    {
      label: t("registered"),
      value: stats.data?.total_registered,
      hint: t("registeredHint"),
      icon: Users,
      loading: stats.isLoading,
      error: stats.error,
    },
  ];

  async function refresh() {
    setRefreshing(true);
    setRefreshFailed(false);
    try {
      await Promise.all([stats.mutate(), managed.mutate(), activity.mutate()]);
    } catch {
      setRefreshFailed(true);
    } finally {
      setRefreshing(false);
    }
  }

  const loading = (
    <div
      className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"
      role="status"
    >
      <Loader2 className="size-5 animate-spin" />
      {t("loading")}
    </div>
  );
  const failure = (
    <div className="space-y-3 p-6" role="alert">
      <p className="text-sm text-destructive">{t("loadError")}</p>
      <Button variant="outline" onClick={refresh} disabled={refreshing}>
        {t("retry")}
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
            {t("adminPanel")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="min-h-11"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {t(refreshing ? "refreshing" : "refresh")}
          </Button>
          {createLink}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="size-3.5" />
        <span>
          {updatedAt
            ? t("updated", { time: formatDate(updatedAt) })
            : t("loading")}
        </span>
      </div>
      {refreshFailed && (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t("refreshError")}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 lg:gap-4">
        {cards.map(
          ({ label, value, hint, icon: Icon, loading: busy, error }) => (
            <div
              key={label}
              className="min-w-0 border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {label}
                </h2>
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </div>
              <div className="mt-4 text-3xl font-semibold tabular-nums">
                {busy ? (
                  <Loader2
                    aria-label={t("loading")}
                    className="size-6 animate-spin text-primary"
                  />
                ) : error || value === undefined ? (
                  <span aria-label={t("unavailable")}>—</span>
                ) : (
                  formatNumber(value)
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {error ? t("unavailable") : hint}
              </p>
            </div>
          ),
        )}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Panel
          title={t("serverStatus")}
          description={t("serverDescription")}
          action={
            <Link
              href="/dashboard/minecraft"
              className="inline-flex min-h-11 items-center gap-1 text-sm text-primary hover:underline"
            >
              {t("viewAll")}
              <ArrowUpRight className="size-4" />
            </Link>
          }
        >
          {managed.error ? (
            failure
          ) : managed.isLoading ? (
            loading
          ) : servers.length === 0 ? (
            <EmptyState
              icon={<Server className="size-8" />}
              title={t("noServers")}
              description={t("noServersHint")}
              action={createLink}
            />
          ) : (
            <>
              <div className="p-4">
                <label htmlFor="server-search" className="sr-only">
                  {t("search")}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
                  <Input
                    id="server-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("search")}
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              <div
                className="overflow-x-auto"
                role="region"
                aria-label={t("serverStatus")}
                tabIndex={0}
              >
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-3">
                        {t("server")}
                      </th>
                      <th scope="col" className="px-4 py-3">
                        {t("status")}
                      </th>
                      <th scope="col" className="px-4 py-3">
                        {t("players")}
                      </th>
                      <th scope="col" className="px-4 py-3">
                        {t("manage")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const percentage =
                        s.max_players > 0
                          ? Math.min(
                              100,
                              Math.max(
                                0,
                                (s.current_players / s.max_players) * 100,
                              ),
                            )
                          : 0;
                      const stateClass =
                        s.status === "running"
                          ? "bg-primary/10 text-primary"
                          : s.status === "error"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground";
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-border last:border-0"
                        >
                          <th scope="row" className="px-5 py-4 font-medium">
                            <span className="block">{s.name}</span>
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              {s.minecraft_version} ·{" "}
                              {s.server_type_display ?? s.server_type}
                            </span>
                          </th>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-2 py-1 text-xs ${stateClass}`}
                            >
                              <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-current"
                              />
                              {t(`statuses.${s.status}`)}
                            </span>
                          </td>
                          <td className="min-w-28 px-4 py-4">
                            <span className="tabular-nums">
                              {s.current_players} / {s.max_players}
                            </span>
                            <div
                              aria-hidden="true"
                              className="mt-2 h-1 bg-muted"
                            >
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              aria-label={t("manageNamed", { name: s.name })}
                              href={`/dashboard/minecraft/${s.id}`}
                              className="inline-flex min-h-11 items-center gap-1 text-primary hover:underline"
                            >
                              {t("manage")}
                              <ArrowUpRight className="size-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    {t("noMatches")}
                  </p>
                )}
              </div>
            </>
          )}
        </Panel>
        <Panel title={t("attention")} description={t("attentionHint")}>
          {managed.error ? (
            failure
          ) : managed.isLoading ? (
            loading
          ) : (
            <div className="space-y-4 p-5">
              {issues.length === 0 && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{t("noErrors")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(servers.length ? "noErrorsHint" : "noMonitoring")}
                    </p>
                  </div>
                </div>
              )}
              {issues.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/minecraft/${s.id}`}
                  className="flex min-h-11 items-start gap-3 border border-destructive/30 bg-destructive/5 p-3"
                >
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span className="min-w-0 text-sm">
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("serverErrorHint")}
                    </span>
                  </span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0" />
                </Link>
              ))}
              {stopped.length > 0 && (
                <Link
                  href="/dashboard/minecraft"
                  className="block border-t border-border pt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("stoppedCount", { count: stopped.length })}
                  <ArrowUpRight className="ml-2 inline size-4" />
                </Link>
              )}
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  {t("quickAccess")}
                </p>
                <div className="flex flex-wrap gap-x-4">
                  <Link
                    href="/dashboard/users"
                    className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
                  >
                    {t("users")}
                  </Link>
                  <Link
                    href="/dashboard/news"
                    className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
                  >
                    {t("news")}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>
      <Panel title={t("recentActivity")} description={t("activityHint")}>
        {activity.error ? (
          failure
        ) : activity.isLoading ? (
          loading
        ) : !activity.data?.length ? (
          <EmptyState
            icon={<Activity className="size-8" />}
            title={t("noActivity")}
            description={t("noActivityHint")}
          />
        ) : (
          <ol className="divide-y divide-border">
            {activity.data.map((entry) => {
              const action =
                actionKeys.find((key) => key === entry.action) ?? "other";
              return (
                <li
                  key={entry.id}
                  className="flex flex-col justify-between gap-2 px-5 py-4 sm:flex-row sm:items-start"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                      <Activity className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {entry.username ?? t("system")}
                        </span>
                        <span className="mx-2 text-muted-foreground">·</span>
                        {t(`actions.${action}`)}
                      </p>
                      {entry.description && (
                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <time
                    dateTime={entry.created_at}
                    className="shrink-0 pl-12 text-xs text-muted-foreground sm:pl-0"
                  >
                    {formatDate(entry.created_at)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}
