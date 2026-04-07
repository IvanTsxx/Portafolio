import { Analytics } from "@vercel/analytics/next";
import { GeistPixelTriangle } from "geist/font/pixel";
import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { GlobalClickSound } from "@/shared/components/global-click-sound";
import { ScrollToTop } from "@/shared/components/scroll-to-top";

import "./globals.css";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    description: SITE.description,
    locale: "en_US",
    siteName: SITE.name,
    title: SITE.name,
    type: "website",
    url: SITE.url,
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  twitter: {
    card: "summary",
    creator: "@ivantsx",
    description: SITE.description,
    title: SITE.name,
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: [
    { color: "#fafafa", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistPixelTriangle.variable}`}
      suppressHydrationWarning
    >
      <body className="relative pixel-grid">
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <ScrollToTop />
              <GlobalClickSound />
              <Toaster position="top-center" />
            </TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
