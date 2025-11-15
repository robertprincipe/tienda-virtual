import type { NextConfig } from "next";

// disable image optimization for now
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
