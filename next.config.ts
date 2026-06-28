import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  // Production build — standalone rejim (minimal output)
  output: 'standalone',
  allowedDevOrigins: [
    "localhost:3000",
    "*.loca.lt",
    "*.ngrok-free.dev",
    "*.ngrok.io"
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
 
export default nextConfig;
