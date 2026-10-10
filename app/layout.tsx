import type { Metadata, Viewport } from "next";

import "./globals.css";
import { SceneLayer } from "@/components/scene/scene-layer";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { fontClassNames } from "@/lib/fonts";
import { siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    description: siteConfig.description,
    siteName: siteConfig.name,
    title: `${siteConfig.name} · Agent Workshop`,
    type: "website",
    url: siteConfig.url,
  },
  title: {
    default: `${siteConfig.name} · Agent Workshop`,
    template: `%s · ${siteConfig.shortName}`,
  },
  twitter: { card: "summary_large_image", creator: `@${siteConfig.handle}` },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ededeb",
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
      <main className="flex flex-1 flex-col" id="main">
        {children}
      </main>
      <SiteFooter />
      <SceneLayer />
    </body>
  </html>
);

export default RootLayout;
