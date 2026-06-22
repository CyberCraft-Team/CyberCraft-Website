"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useDailyBonusStatus, useReferralInfo, getUserToken } from "@/lib/api/hooks";
import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, Gift, Coins, Link2, Copy, Calendar, Shield, User, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SkinViewer3D from "@/components/skin-viewer-3d";
import { apiClient } from "@/lib/api";

// Custom hook for counting animation
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

// Animated Number Component
function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const animatedValue = useCountUp(value);
  return <span className={className}>{animatedValue}</span>;
}

// Progress Bar Component
function ProgressBar({
  current,
  max,
  className = "",
  showPercentage = true
}: {
  current: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
}) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="w-full h-2 bg-[var(--bg-dark)] rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] transition-all duration-1000 ease-out ${className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-[var(--text-secondary)] text-right">
          {current} / {max} ({Math.round(percentage)}%)
        </p>
      )}
    </div>
  );
}

// Streak Calendar Component
function StreakCalendar({ streak }: { streak: number }) {
  const days = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];
  const maxDays = 7;

  return (
    <div className="flex gap-1 justify-center mt-3">
      {days.map((day, index) => {
        const isActive = index < Math.min(streak, maxDays);
        return (
          <div
            key={index}
            className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'
              }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-300 ${isActive
                ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] shadow-lg'
                : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                }`}
            >
              {day}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CabinetProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isLoading, refreshUser } = useAuth();
  const { bonusStatus, claimBonus, mutate: mutateBonusStatus } = useDailyBonusStatus();
  const { referralInfo } = useReferralInfo();
  const [isUploading, setIsUploading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleSkinUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.name.toLowerCase().endsWith(".png")) {
      toast({
        title: "Xatolik",
        description: "Faqat PNG formatdagi fayllar qabul qilinadi",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await apiClient.uploadSkin(token, file);
      toast({
        title: "Muvaffaqiyat",
        description: result.message || "Skin muvaffaqiyatli yuklandi!",
      });
      await refreshUser();
    } catch (error) {
      toast({
        title: "Xatolik",
        description:
          error instanceof Error ? error.message : "Skin yuklashda xatolik",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Profil
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Hisob ma'lumotlari va skin boshqaruvi
        </p>
      </div>

      {/* Account Info */}
      <Card className="cyber-card border-[var(--border-color)] bg-[var(--bg-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">
            Hisob ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">
                  Login
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user.username}
                </p>
              </div>
            </div>

            {/* Email */}
            {user.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[var(--secondary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* CC Balance */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">
                  Balans
                </p>
                <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)]">
                  <AnimatedNumber value={user.cc_balance ?? 0} /> CC
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">Holat</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {user.is_whitelisted ? (
                    <Badge
                      variant="outline"
                      className="border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Whitelist
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/10 text-xs"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Yo'q
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skin & Cape Card */}
      <Card className="cyber-card border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--primary)]" />
            Minecraft Skin & Plash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 3D Viewer */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-[var(--primary)]/5 rounded-2xl blur-xl" />
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[var(--bg-dark)] to-[#0a0a14] border border-[var(--border-color)] p-2">
                  {user.skin_url ? (
                    <SkinViewer3D
                      skinUrl={user.skin_url}
                      capeUrl={user.cape_url}
                      width={400}
                      height={500}
                    />
                  ) : (
                    <div className="w-[400px] h-[500px] rounded-lg bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary-dark)]/10 flex flex-col items-center justify-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <User className="w-12 h-12 text-[var(--primary)]" />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Skin yuklanmagan</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-[var(--text-secondary)] mt-2 opacity-60">
                  Suring va aylantiring
                </p>
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex flex-col gap-6 justify-center">
              {/* Skin Upload */}
              <div className="p-5 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-bold">Skin yuklash</h3>
                    <p className="text-xs text-[var(--text-secondary)]">PNG format, 64x64 yoki 64x32 piksel</p>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".png"
                  onChange={handleSkinUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full cyber-btn"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Skinni tanlash
                    </>
                  )}
                </Button>
              </div>

              {/* Cape Upload */}
              <div className="p-5 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-color)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--secondary)]/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[var(--secondary)]" />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-bold">Plash yuklash</h3>
                    <p className="text-xs text-[var(--text-secondary)]">PNG format, 64x32 piksel</p>
                  </div>
                </div>
                <input
                  type="file"
                  id="cape-upload"
                  accept=".png"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const token = getUserToken();
                      const formData = new FormData();
                      formData.append("cape", file);
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
                      const res = await fetch(`${apiUrl}/auth/launcher/cape/`, {
                        method: "POST",
                        headers: { Authorization: `Token ${token}` },
                        body: formData,
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.error || "Plash yuklashda xatolik");
                      }
                      toast({ title: "Muvaffaqiyat!", description: "Plash muvaffaqiyatli yuklandi!" });
                      await refreshUser();
                    } catch (error) {
                      toast({
                        title: "Xatolik",
                        description: error instanceof Error ? error.message : "Plash yuklashda xatolik",
                        variant: "destructive",
                      });
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById("cape-upload")?.click()}
                  disabled={isUploading}
                  variant="outline"
                  className="w-full cyber-btn"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Plashni tanlash
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Statistika va Mukofotlar
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* CC Balance Card */}
          <Card className="cyber-card border-[var(--border-color)] bg-[var(--bg-card)] group hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                <Coins className="w-5 h-5 text-[var(--primary)] group-hover:rotate-12 transition-transform duration-300" />
                CC Balans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)]">
                  <AnimatedNumber value={user.cc_balance ?? 0} />
                </p>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                CyberCraft Coins
              </p>

              {user.rank && (
                <div className="mt-3">
                  <Badge className="mb-2 bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]">
                    {user.rank}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Bonus Card */}
          <Card className="cyber-card border-[var(--border-color)] bg-[var(--bg-card)] group hover:border-[var(--secondary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--secondary)]/20 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                <Gift className="w-5 h-5 text-[var(--secondary)] group-hover:scale-110 transition-transform duration-300" />
                Kunlik Bonus
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bonusStatus ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--primary-dark)]">
                      +<AnimatedNumber value={bonusStatus.next_bonus} /> CC
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      Streak: <span className="font-bold text-[var(--secondary)]">{bonusStatus.streak}</span> kun
                    </p>
                  </div>

                  <StreakCalendar streak={bonusStatus.streak} />

                  <Button
                    className="w-full mt-4 cyber-btn"
                    disabled={!bonusStatus.can_claim || isClaiming}
                    onClick={async () => {
                      setIsClaiming(true);
                      try {
                        const result = await claimBonus();
                        toast({
                          title: "Muvaffaqiyat!",
                          description: `${result.amount} CC oldingiz! Yangi balans: ${result.new_balance}`,
                        });
                        await refreshUser();
                        mutateBonusStatus();
                      } catch (error) {
                        toast({
                          title: "Xatolik",
                          description: error instanceof Error ? error.message : "Bonus olishda xatolik",
                          variant: "destructive",
                        });
                      } finally {
                        setIsClaiming(false);
                      }
                    }}
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Yuklanmoqda...
                      </>
                    ) : bonusStatus.can_claim ? (
                      "Bonus olish"
                    ) : (
                      "Ertaga keling"
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--secondary)]" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Card */}
          <Card className="cyber-card border-[var(--border-color)] bg-[var(--bg-card)] group hover:border-[var(--accent)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--accent)]/20 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[var(--accent)] group-hover:rotate-45 transition-transform duration-300" />
                Referal Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referralInfo ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--primary-dark)]">
                      <AnimatedNumber value={referralInfo.referral_count} />
                    </p>
                    <span className="text-sm text-[var(--text-secondary)]">taklif</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Har bir taklif uchun +{referralInfo.bonus_per_invite} CC
                  </p>


                  <div className="mt-4 p-2 bg-[var(--bg-dark)] rounded-lg flex items-center gap-2 border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors">
                    <code className="text-xs text-[var(--primary)] flex-1 truncate">
                      {referralInfo.referral_code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 hover:bg-[var(--primary)]/20"
                      onClick={() => {
                        navigator.clipboard.writeText(referralInfo.referral_link);
                        toast({
                          title: "Nusxalandi!",
                          description: "Referal link nusxalandi",
                        });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
