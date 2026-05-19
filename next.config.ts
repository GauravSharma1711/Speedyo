import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
    ignoreDuringBuilds: true,  // ignore ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true,   // ignore TypeScript errors
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
