import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthProvider } from "@/lib/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import { routing } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// uz, ru and en are all rendered at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("description"),
    keywords: t("keywords").split(","),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: t("ogLocale"),
      siteName: t("siteName"),
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://cybercraft.uz",
    ),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required for the static rendering of this segment.
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <AuthProvider>{children}</AuthProvider>
            {/* Without this every toast() call was a silent no-op: the profile
                page raised them for skin uploads, cape uploads, bonus claims
                and referral copies, and none of them ever appeared. */}
            <Toaster />
          </GoogleOAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
