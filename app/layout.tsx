import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchDialog } from "@/components/search-dialog";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontSans = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Iván Bongiovanni - Full-Stack Developer",
    template: "%s | Iván Bongiovanni",
  },
  description:
    "Desarrollador Full-Stack especializado en TypeScript, React, Next.js y Node.js. Creando soluciones web modernas y eficientes.",
  keywords: [
    "Iván Bongiovanni",
    "Full-Stack Developer",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Desarrollo Web",
  ],
  authors: [{ name: "Iván Bongiovanni" }],
  creator: "Iván Bongiovanni",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ivantsx.dev",
    title: "Iván Bongiovanni - Full-Stack Developer",
    description:
      "Desarrollador Full-Stack especializado en TypeScript, React, Next.js y Node.js.",
    siteName: "Iván Bongiovanni Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iván Bongiovanni - Full-Stack Developer",
    description:
      "Desarrollador Full-Stack especializado en TypeScript, React, Next.js y Node.js.",
    creator: "@IvanTsxx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      dir="rtl"
      lang="ar"
      className={fontSans.variable}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <DirectionProvider direction="rtl">
          <Header />
          {children}
          <Footer />
          <SearchDialog />
          <Toaster richColors position="top-center" />
        </DirectionProvider>
      </body>
    </html>
  );
}
