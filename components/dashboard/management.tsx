"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Inbox, Loader2, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ManagementToolbar({
  count,
  shown,
  loading,
  onRefresh,
  children,
}: {
  count: number;
  shown?: number;
  loading: boolean;
  onRefresh: () => Promise<unknown>;
  children?: ReactNode;
}) {
  const t = useTranslations("dashboard.management");
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  async function refresh() {
    setRefreshing(true);
    setFailed(false);
    try {
      await onRefresh();
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-muted-foreground">
            {t("loaded")}{" "}
            <strong className="ml-2 font-semibold tabular-nums text-foreground">
              {loading ? "—" : count}
            </strong>
          </span>
          {shown !== undefined && (
            <span className="text-muted-foreground">
              {t("shown")}{" "}
              <strong className="ml-2 font-semibold tabular-nums text-foreground">
                {loading ? "—" : shown}
              </strong>
            </span>
          )}
          {children}
        </div>
        <Button
          variant="outline"
          className="min-h-11"
          disabled={refreshing || loading}
          onClick={refresh}
        >
          <RefreshCw
            className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {t(refreshing ? "refreshing" : "refresh")}
        </Button>
      </div>
      {failed && (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {t("refreshFailed")}
        </p>
      )}
    </div>
  );
}

export function ManagementError({
  onRetry,
}: {
  onRetry: () => Promise<unknown>;
}) {
  const t = useTranslations("dashboard.management");
  const [busy, setBusy] = useState(false);
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 border border-destructive/30 bg-destructive/5 p-5"
    >
      <ShieldAlert className="size-5 text-destructive" />
      <h2 className="font-semibold">{t("loadFailed")}</h2>
      <p className="text-sm text-muted-foreground">{t("loadFailedHint")}</p>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onRetry();
          } catch {
            /* Keep the existing error visible. */
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
        {t("retry")}
      </Button>
    </div>
  );
}

export function ManagementEmpty({
  searching,
  action,
}: {
  searching: boolean;
  action?: ReactNode;
}) {
  const t = useTranslations("dashboard.management");
  const Icon = searching ? Search : Inbox;
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 border border-border bg-card p-6 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <h2 className="font-medium">{t(searching ? "noMatches" : "empty")}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t(searching ? "searchHint" : "emptyHint")}
      </p>
      {!searching && action}
    </div>
  );
}
