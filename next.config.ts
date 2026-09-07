import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Production build — standalone rejim (minimal output)
  output: "standalone",
  // Every backend call goes through /api/backend/<path>/ with the trailing
  // slash Django's APPEND_SLASH wants. Next's default is to answer such a
  // URL with a 308 to the slashless form, so each request was made twice --
  // and a server-archive upload sent its whole body twice before the proxy
  // ever saw it. Let the route handler serve the slashed path directly.
  skipTrailingSlashRedirect: true,
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
