"use client";

import { useState } from "react";
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
import { useAdminUsers, getAdminToken } from "@/lib/api/hooks";
import type { User } from "@/lib/api/types";

export default function UsersPage() {
  const { users, isLoading, mutate } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWhitelist = async (userId: number, currentStatus: boolean) => {
    try {
      const token = getAdminToken();
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/users/${userId}/whitelist/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ is_whitelisted: !currentStatus }),
        }
      );
      mutate();
    } catch (error) {
      console.error("Whitelist o'zgartirishda xato:", error);
    }
  };

  const toggleOperator = async (userId: number, currentStatus: boolean) => {
    try {
      const token = getAdminToken();
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/users/${userId}/operator/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ is_operator: !currentStatus }),
        }
      );
      mutate();
    } catch (error) {
      console.error("Operator o'zgartirishda xato:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Foydalanuvchilar
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Foydalanuvchilarni boshqarish va ruxsatlarni sozlash
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <Input
          placeholder="Foydalanuvchilarni qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-[var(--bg-card)] border-[var(--border-color)]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : (
        <Card className="cyber-card border-[var(--border-color)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Foydalanuvchi
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Holat
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Ro'yxatdan o'tgan
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-dark)]/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[var(--bg-dark)] font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {user.username}
                          </p>
                          {user.is_staff && (
                            <span className="text-xs text-[var(--primary)]">
                              Staff
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
                            Operator
                          </span>
                        )}
                        {!user.is_whitelisted && !user.is_operator && (
                          <span className="text-[var(--text-secondary)] text-xs">
                            Oddiy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[var(--text-secondary)] text-sm">
                        {new Date(user.created_at).toLocaleDateString("uz-UZ")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                                Whitelist dan chiqarish
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Whitelist ga qo'shish
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
                                Operator dan chiqarish
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Operator qilish
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
