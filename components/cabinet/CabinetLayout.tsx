"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import CabinetSidebar from "./CabinetSidebar";

interface CabinetLayoutProps {
  children: React.ReactNode;
}

export default function CabinetLayout({ children }: CabinetLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <CabinetSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
