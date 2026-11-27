import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep local artwork inspection unobscured; compilation errors still surface.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
    ] }];
  },
  outputFileTracingIncludes: {
    // Native createRequire resolution inside the image worker is intentionally
    // outside bundler module IDs. Trace Sharp and installed platform binaries.
    "/api/generate": ["./node_modules/sharp/**/*", "./node_modules/@img/sharp-*/**/*"],
    "/api/render": ["./public/fonts/**/*"],
    "/api/notices": ["./docs/licenses/NOTICES.txt", "./docs/licenses/NOTICE_SUPPLEMENT.txt", "./docs/licenses/Tabler-MIT.txt", "./public/fonts/OFL-*.txt"],
  },
};

export default nextConfig;
