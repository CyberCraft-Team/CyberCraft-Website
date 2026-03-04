"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useUserAuth } from "@/lib/api/hooks";
import type { UserMinimal } from "@/lib/api/types";

interface AuthContextType {
    user: UserMinimal | null;
    token: string | null;
    isLoading: boolean;
    isError: any;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useUserAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
