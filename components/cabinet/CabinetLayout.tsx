"use client";

import { Header } from "@/components/header";
import CabinetSidebar from "./CabinetSidebar";
import CabinetMobileNavigation from "./CabinetMobileNavigation";

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <Header />
      <div className="flex">
        <CabinetSidebar />
        <main className="min-w-0 flex-1 lg:ml-64">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      <CabinetMobileNavigation />
    </div>
  );
}
