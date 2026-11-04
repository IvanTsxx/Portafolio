import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/config";
import { appIconSizes } from "@/lib/site/icon-mark";
import { printColors } from "@/lib/site/print-colors";
import { pageSeo, siteTitle } from "@/lib/site/seo";

const appIcons = appIconSizes.map((size) => ({
  sizes: `${size}x${size}`,
  src: `/pwa-icon/${size}`,
  type: "image/png",
}));

const maskableIcon = appIcons.at(-1);

const manifest = (): MetadataRoute.Manifest => ({
  background_color: printColors.charcoal,
  description: pageSeo.home.description,
  display: "standalone",
  icons: [
    ...appIcons.map((icon) => ({ ...icon, purpose: "any" as const })),
    ...(maskableIcon
      ? [{ ...maskableIcon, purpose: "maskable" as const }]
      : []),
  ],
  lang: "en",
  name: siteTitle,
  short_name: siteConfig.nickname,
  start_url: "/",
  theme_color: printColors.charcoal,
});

export default manifest;
