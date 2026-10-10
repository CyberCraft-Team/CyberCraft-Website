"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ManagementToolbar,
  ManagementError,
  ManagementEmpty,
} from "@/components/dashboard/management";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Search,
  Loader2,
  MoreVertical,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api/fetcher";
import { useAdminUsers } from "@/lib/api/hooks";

export default function UsersPage() {
  const t = useTranslations("dashboard.copy");
  const m = useTranslations("dashboard.management");
  const locale = useLocale();
  const { users, isLoading, isError: listError, mutate } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user: any) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Through the proxy on this app's own origin, which attaches the admin
  // token from the HttpOnly cookie. Calling the Django origin directly sent
  // no credential at all, so every one of these buttons answered 401 -- and
  // the old code never checked the response, so the failure was silent.
  const toggleWhitelist = async (userId: number, currentStatus: boolean) => {
    setActionError(null);
    try {
      await apiFetch(`admin/users/${userId}/whitelist/`, {
        method: "POST",
        json: { is_whitelisted: !currentStatus },
      });
      mutate();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : t("could_not_update_the_whitelist"),
      );
    }
  };

  const toggleOperator = async (userId: number, currentStatus: boolean) => {
    setActionError(null);
    try {
      await apiFetch(`admin/users/${userId}/operator/`, {
        method: "POST",
        json: { is_operator: !currentStatus },
      });
      mutate();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : t("could_not_update_operator_permissions"),
      );
    }
  };

  return (
    <div className="management-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {t("users")}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {t("manage_accounts_and_access_permissions")}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <Input
          placeholder={t("search_users")}
          aria-label={t("search_users")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-[var(--bg-card)] border-[var(--border-color)]"
        />
      </div>

      <ManagementToolbar
        count={users.length}
        shown={filteredUsers.length}
        loading={isLoading || Boolean(listError)}
        onRefresh={async () => {
          await mutate();
        }}
      />

      {actionError && (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {actionError}
        </p>
      )}

      {listError ? (
        <ManagementError
          onRetry={async () => {
            await mutate();
          }}
        />
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <ManagementEmpty searching={Boolean(searchQuery.trim())} />
      ) : (
        <Card className="cyber-card border-[var(--border-color)] overflow-hidden">
          <div
            className="overflow-x-auto"
            role="region"
            aria-label={t("users")}
            tabIndex={0}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    {t("user")}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    {t("email")}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    {t("status")}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    {t("registered")}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-dark)]/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[var(--bg-dark)] font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            <Link
                              href={`/dashboard/users/${user.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {user.username}
                            </Link>
                          </p>
                          {user.is_staff && (
                            <span className="text-xs text-[var(--primary)]">
                              {t("staff")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[var(--text-secondary)]">
                        {user.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.is_whitelisted && (
                          <span className="px-2 py-0.5 rounded text-xs bg-[var(--accent)]/20 text-[var(--accent)]">
                            Whitelist
                          </span>
                        )}
                        {user.is_operator && (
                          <span className="px-2 py-0.5 rounded text-xs bg-[var(--secondary)]/20 text-[var(--secondary)]">
                            {t("operator")}
                          </span>
                        )}
                        {!user.is_whitelisted && !user.is_operator && (
                          <span className="text-[var(--text-secondary)] text-xs">
                            {t("standard")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[var(--text-secondary)] text-sm">
                        {new Date(user.created_at).toLocaleDateString(locale)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-11"
                            aria-label={m("actionsFor", {
                              name: user.username,
                            })}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              toggleWhitelist(user.id, user.is_whitelisted)
                            }
                          >
                            {user.is_whitelisted ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                {t("remove_from_whitelist")}
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                {t("add_to_whitelist")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleOperator(user.id, user.is_operator)
                            }
                          >
                            {user.is_operator ? (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                {t("remove_operator_access")}
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                {t("grant_operator_access")}
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
