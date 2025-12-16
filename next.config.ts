import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Enable ESLint during builds - fix errors instead of ignoring
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
