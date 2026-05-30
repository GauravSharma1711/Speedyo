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
    images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      // Add your production domain here later
      // { protocol: "https", hostname: "yourdomain.com", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
