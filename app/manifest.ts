import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/config";

const manifest = (): MetadataRoute.Manifest => ({
  background_color: "#0b0a09",
  description: siteConfig.description,
  display: "standalone",
  icons: [{ sizes: "any", src: "/favicon.ico", type: "image/x-icon" }],
  name: `${siteConfig.nickname} · Agent Workshop`,
  short_name: siteConfig.nickname,
  start_url: "/",
  theme_color: "#121110",
});

export default manifest;
