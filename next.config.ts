import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep local artwork inspection unobscured; compilation errors still surface.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
