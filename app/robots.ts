import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/content/metadata";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: absoluteUrl("/sitemap.xml"),
});

export default robots;
