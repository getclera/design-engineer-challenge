import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "radix-ui", "framer-motion"],
  },
};

export default nextConfig;
