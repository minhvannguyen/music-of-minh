import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "localhost", port: "7114" },
      { protocol: "http", hostname: "localhost", port: "7114" },
    ],
  },
  async rewrites() {
    return [
      // Proxy static files from backend to avoid CORS
      { source: "/uploads/:path*", destination: "https://localhost:7114/uploads/:path*" },
    ];
  },
};

export default nextConfig;