"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gamepad2, User, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Kirish amalga oshmadi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-dark)] to-[#0f0f1a]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--secondary)]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="cyber-card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center glow-box">
                <Gamepad2 className="w-7 h-7 text-[var(--bg-dark)]" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-[var(--primary)] neon-cyan">CYBER</span>
                <span className="text-[var(--secondary)]">CRAFT</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-6">
              Hisobga kirish
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              CyberCraft hisobingizga kiring
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <Input
                  type="text"
                  placeholder="Username kiriting"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-12 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <Input
                  type="password"
                  placeholder="Parol kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cyber-btn h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Kirish...
                </>
              ) : (
                "Kirish"
              )}
            </Button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <Link
              href="/forgot-password"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              Parolni unutdingizmi?
            </Link>
          </div>

          <p className="text-center text-[var(--text-secondary)] mt-4">
            Hisobingiz yo'qmi?{" "}
            <Link
              href="/register"
              className="text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors font-medium"
            >
              Ro'yxatdan o'tish
            </Link>
          </p>

          <p className="text-center text-[var(--text-secondary)] mt-4">
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm"
            >
              Bosh sahifaga qaytish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
