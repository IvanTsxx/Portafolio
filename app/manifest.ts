import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/config";
import { iconMarks } from "@/lib/site/icon-mark";
import { printColors } from "@/lib/site/print-colors";
import { pageSeo, siteTitle } from "@/lib/site/seo";

const manifest = (): MetadataRoute.Manifest => ({
  background_color: printColors.paper,
  description: pageSeo.home.description,
  display: "standalone",
  icons: [
    {
      sizes: `${iconMarks.tab.size}x${iconMarks.tab.size}`,
      src: "/icon",
      type: "image/png",
    },
    {
      sizes: `${iconMarks.touch.size}x${iconMarks.touch.size}`,
      src: "/apple-icon",
      type: "image/png",
    },
  ],
  lang: "en",
  name: siteTitle,
  short_name: siteConfig.nickname,
  start_url: "/",
  theme_color: printColors.paper,
});

export default manifest;
