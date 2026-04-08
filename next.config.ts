import type { NextConfig } from "next";

import "./env/server";
import "./env/client";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  /* prohibir ir a /pages y a /blocks momentaneamente */
  // oxlint-disable-next-line require-await
  async redirects() {
    return [
      { destination: "/", permanent: false, source: "/pages" },
      { destination: "/", permanent: false, source: "/blocks" },
    ];
  },
};

export default nextConfig;
