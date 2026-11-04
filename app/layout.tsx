import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { SceneLayer } from "@/components/scene/scene-layer";
import { GuideGlow } from "@/components/site/guide-glow";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Underside } from "@/components/underside/underside";
import { fontClassNames } from "@/lib/fonts";
import { siteConfig } from "@/lib/site/config";
import { lightBackground, printColors } from "@/lib/site/print-colors";
import { pageSeo, siteTitle } from "@/lib/site/seo";
import { PagePeel } from "@/registry/ivan/components/page-peel/page-peel";

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
  colorScheme: "dark light",
  themeColor: [
    { color: lightBackground, media: "(prefers-color-scheme: light)" },
    { color: printColors.charcoal, media: "(prefers-color-scheme: dark)" },
  ],
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    className={fontClassNames}
    data-detail="guides"
    lang="en"
    suppressHydrationWarning
  >
    <body className="flex min-h-svh flex-col">
      <ThemeProvider>
        <a
          className="label bg-foreground text-background fixed top-2 left-2 z-100 -translate-y-20 px-3 py-2 focus:translate-y-0"
          href="#main"
        >
          Skip to content
        </a>
        <div
          aria-hidden
          className="grain pointer-events-none fixed inset-0 z-60"
        />
        <PagePeel
          className="flex flex-1 flex-col"
          underside={<Underside />}
          undersideLabel="Working drawing of this site"
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          <SceneLayer />
          <GuideGlow />
        </PagePeel>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);

export default RootLayout;
