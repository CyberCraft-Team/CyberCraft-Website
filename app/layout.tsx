import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "CyberCraft - Minecraft Serverlari",
    template: "%s | CyberCraft",
  },
  description:
    "CyberCraft - eng yaxshi Minecraft serverlari platformasi. O'yin serverlari, modpacklar, va kuchli jamoa.",
  keywords: [
    "minecraft",
    "server",
    "cybercraft",
    "minecraft server",
    "uzbekistan minecraft",
    "minecraft uz",
  ],
  openGraph: {
    title: "CyberCraft - Minecraft Serverlari",
    description:
      "CyberCraft - eng yaxshi Minecraft serverlari platformasi. O'yin serverlari, modpacklar, va kuchli jamoa.",
    type: "website",
    locale: "uz_UZ",
    siteName: "CyberCraft",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://cybercraft.uz"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
