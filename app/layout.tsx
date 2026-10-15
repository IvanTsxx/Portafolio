import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { CompanionGame } from "@/components/agent-game/companion-game";
import { Companion } from "@/components/scene/companion";
import { SceneLayer } from "@/components/scene/scene-layer";
import { SiteHeader } from "@/components/site/site-header";
import { fontClassNames } from "@/lib/fonts";
import { siteConfig } from "@/lib/site/config";
import { printColors } from "@/lib/site/print-colors";
import { pageSeo, siteTitle } from "@/lib/site/seo";

export const metadata: Metadata = {
  applicationName: siteConfig.nickname,
  authors: [{ name: siteConfig.nickname, url: siteConfig.url }],
  creator: siteConfig.nickname,
  description: pageSeo.home.description,
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteTitle,
    template: `%s · ${siteConfig.nickname}`,
  },
  twitter: { card: "summary_large_image", creator: `@${siteConfig.handle}` },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: printColors.paper,
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html className={fontClassNames} lang="en">
    <body className="flex min-h-svh flex-col">
      <a
        className="label bg-clay text-primary-foreground fixed top-2 left-2 z-100 -translate-y-20 px-3 py-2 focus:translate-y-0"
        href="#main"
      >
        Skip to content
      </a>
      <SiteHeader />
      {children}
      <SceneLayer />
      <Companion />
      <CompanionGame />
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
