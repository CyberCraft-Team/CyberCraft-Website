import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Production build — standalone rejim (minimal output)
  output: "standalone",
  allowedDevOrigins: [
    "localhost:3000",
    "*.loca.lt",
    "*.ngrok-free.dev",
    "*.ngrok.io",
  ],
  images: {
    // Skins, capes and news images come from the backend, whose host differs
    // per environment. Narrow this to the actual backend host once the
    // production domain is settled.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
