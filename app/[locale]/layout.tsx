import type React from "react";
import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthProvider } from "@/lib/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ExtensionAttributeGuard } from "@/components/extension-attribute-guard";
import { Toaster } from "@/components/ui/toaster";
import { routing } from "@/i18n/routing";
import "./globals.css";

/*
 * Type stack shared with the launcher's v2 direction.
 *
 * Press Start 2P carries the Minecraft read but is roughly twice as wide
 * per glyph as a normal sans, so it is reserved for the wordmark, section
 * labels, and short headings. Chakra Petch does the body work: its
 * clipped corners echo the blocky geometry without costing legibility,
 * and it ships Cyrillic, which the ru locale needs.
 */
const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/* Chakra Petch ships no Cyrillic, so the ru locale falls through to Segoe
   UI in the --font-sans stack. That is what the whole site rendered in
   before this change, so Russian is unchanged rather than degraded. */
const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

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
      <head>
        <ExtensionAttributeGuard />
      </head>
      <body
        className={`${pixel.variable} ${chakra.variable} ${jbMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
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
