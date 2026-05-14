import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 1080],
    imageSizes: [256, 384],
    qualities: [70],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
