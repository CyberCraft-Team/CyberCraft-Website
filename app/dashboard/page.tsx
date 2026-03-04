"use client";

import { Server, Users, Activity, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats, useServers, useNews } from "@/lib/api/hooks";

export default function DashboardPage() {
  const { stats, isLoading: statsLoading } = useStats();
  const { servers, isLoading: serversLoading } = useServers();
  const { news, isLoading: newsLoading } = useNews();

  const statsCards = [
    {
      title: "Online O'yinchilar",
      value: stats?.online_players || 0,
      icon: Users,
      color: "var(--primary)",
    },
    {
      title: "Aktiv Serverlar",
      value:
        stats?.active_servers ||
        servers.filter((s) => s.status === "online").length,
      icon: Server,
      color: "var(--accent)",
    },
    {
      title: "Maksimum Online",
      value: stats?.max_online || 0,
      icon: TrendingUp,
      color: "var(--secondary)",
    },
    {
      title: "Ro'yxatdan o'tganlar",
      value: stats?.total_registered || 0,
      icon: Activity,
      color: "var(--warning)",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          CyberCraft boshqaruv paneli
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="cyber-card border-[var(--border-color)]"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
              ) : (
                <p className="text-3xl font-bold" style={{ color: stat.color }}>
                  {stat.value.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="cyber-card border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Serverlar holati
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serversLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
              </div>
            ) : (
              <div className="space-y-4">
                {servers.slice(0, 5).map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-dark)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          server.status === "online"
                            ? "bg-[var(--accent)]"
                            : server.status === "maintenance"
                            ? "bg-[var(--warning)]"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-[var(--text-primary)]">
                        {server.name}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {server.current_players}/{server.max_players}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cyber-card border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              So'nggi yangiliklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
              </div>
            ) : (
              <div className="space-y-4">
                {news.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-[var(--bg-dark)] border-l-2"
                    style={{ borderColor: item.category_color }}
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {new Date(item.date).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
