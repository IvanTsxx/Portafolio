import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site/seo";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: absoluteUrl("/sitemap.xml"),
});

export default robots;
