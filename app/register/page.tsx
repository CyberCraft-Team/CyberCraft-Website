"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Gamepad2,
  User,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import GoogleLoginButton from "@/components/auth/google-login-button";
import TelegramLoginButton from "@/components/auth/telegram-login-button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [skinPreview, setSkinPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".png")) {
        setErrors((prev) => ({
          ...prev,
          skin: ["Faqat PNG formatdagi skinlar qabul qilinadi"],
        }));
        return;
      }
      if (file.size > 256 * 1024) {
        setErrors((prev) => ({
          ...prev,
          skin: ["Skin fayl hajmi 256KB dan oshmasligi kerak"],
        }));
        return;
      }
      setSkinFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSkinPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear skin error
      if (errors.skin) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.skin;
          return newErrors;
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!skinFile) {
      setErrors({ skin: ["Skin faylini yuklash shart"] });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.register({
        ...formData,
        skin: skinFile,
      });
      setIsSuccess(true);
    } catch (err: any) {
      if (err.message) {
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.errors) {
            setErrors(errorData.errors);
          } else {
            setErrors({ general: [err.message] });
          }
        } catch {
          setErrors({
            general: [err.message || "Ro'yxatdan o'tish amalga oshmadi"],
          });
        }
      } else {
        setErrors({ general: ["Ro'yxatdan o'tish amalga oshmadi"] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-dark)] to-[#0f0f1a]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--secondary)]/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="cyber-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Muvaffaqiyatli ro'yxatdan o'tdingiz!
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Akkountingiz yaratildi. Endi CyberCraft Launcher'ni yuklab olib,
              o'yinga kirishingiz mumkin.
            </p>
            <div className="space-y-4">
              <Link href="/#download">
                <Button className="w-full cyber-btn h-12 text-lg">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Launcher yuklab olish
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full h-12 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] bg-transparent"
                >
                  Bosh sahifaga qaytish
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Ro'yxatdan o'tish
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              CyberCraft serverida o'ynash uchun akkount yarating
            </p>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{errors.general[0]}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username - bu ham Minecraft username */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Username (Minecraft nomi) *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <Input
                  type="text"
                  name="username"
                  placeholder="O'yindagi ismingiz"
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-12 h-12 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)] ${errors.username ? "border-red-500" : ""
                    }`}
                  required
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username[0]}</p>
              )}
              <p className="text-xs text-[var(--text-secondary)]/70">
                3-16 ta belgi. Bu sizning Minecraft username'ingiz bo'ladi
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email kiriting"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-12 h-12 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)] ${errors.email ? "border-red-500" : ""
                    }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Parol *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Parol kiriting"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-12 h-12 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)] ${errors.password ? "border-red-500" : ""
                    }`}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password[0]}</p>
              )}
            </div>

            {/* Password Confirm */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Parolni tasdiqlang *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <Input
                  type="password"
                  name="password_confirm"
                  placeholder="Parolni qayta kiriting"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className={`pl-12 h-12 bg-[var(--bg-dark)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--primary)] ${errors.password_confirm ? "border-red-500" : ""
                    }`}
                  required
                />
              </div>
              {errors.password_confirm && (
                <p className="text-red-500 text-sm">
                  {errors.password_confirm[0]}
                </p>
              )}
            </div>

            {/* Minecraft Skin */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)] block">
                Minecraft Skin *
              </label>

              {!skinFile ? (
                <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--primary)] bg-[var(--bg-dark)]/50 rounded-xl cursor-pointer transition-all group ${errors.skin ? "border-red-500" : ""}`}>
                  <Upload className="w-7 h-7 text-[var(--text-secondary)]/70 group-hover:text-[var(--primary)] transition-colors mb-2" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    Skin faylini yuklang (.png)
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]/50 mt-1">
                    Maksimal 256KB, 64x64 yoki 64x32
                  </span>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                skinPreview && (
                  <div className="flex items-center gap-4 p-3 bg-[var(--bg-dark)] border border-[var(--primary)] rounded-xl">
                    <img
                      src={skinPreview}
                      alt="Skin Preview"
                      className="w-14 h-14 rounded border border-[var(--border-color)] bg-black/40"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-[var(--text-primary)]">
                        {skinFile.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {(skinFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-2 text-xs"
                      onClick={() => {
                        setSkinFile(null);
                        setSkinPreview(null);
                      }}
                    >
                      O'chirish
                    </Button>
                  </div>
                )
              )}
              {errors.skin && (
                <p className="text-red-500 text-sm">{errors.skin[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cyber-btn h-12 text-lg mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            <GoogleLoginButton />
            <TelegramLoginButton />
          </div>

          <p className="text-center text-[var(--text-secondary)] mt-6">
            Akkountingiz bormi?{" "}
            <Link
              href="/login"
              className="text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors font-medium"
            >
              Kirish
            </Link>
          </p>

          <p className="text-center text-[var(--text-secondary)] mt-4">
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Bosh sahifaga qaytish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
