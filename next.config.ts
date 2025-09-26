import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Allow up to 10MB files
    },
  },
  // Fix the turbopack warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
