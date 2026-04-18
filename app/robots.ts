import type { MetadataRoute } from "next";

import { SITE } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: "/",
        disallow: ["/api/", "/preview/", "/_vercel/"],
        userAgent: "*",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
