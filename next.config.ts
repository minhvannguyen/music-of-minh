import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

      // production server
      {
        protocol: "http",
        hostname: "116.118.9.97",
      },

      // dev localhost
      {
        protocol: "https",
        hostname: "localhost",
        port: "7114",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "7114",
      },
    ],
  },

  async rewrites() {
    if (!API_URL) return [];

    return [
      {
        source: "/uploads/:path*",
        destination: `${API_URL.replace("/api", "")}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;