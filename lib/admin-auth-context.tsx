"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminAuth } from "@/lib/api/hooks";
import type { AdminUser } from "@/lib/api/types";

interface AdminAuthContextType {
    user: AdminUser | null;
    isLoading: boolean;
    isError: any;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const auth = useAdminAuth();

    return (
        <AdminAuthContext.Provider value={auth}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuthContext(): AdminAuthContextType {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error(
            "useAdminAuthContext must be used within an AdminAuthProvider"
        );
    }
    return context;
}
