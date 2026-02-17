import { RootProvider } from "fumadocs-ui/provider/next";
import "@/styles/global.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ivan Bongiovanni | Full-Stack Developer",
    template: "%s | Ivan Bongiovanni",
  },
  description:
    "Full-Stack Developer especializado en Next.js y React. Construyo aplicaciones web rápidas, escalables y orientadas al negocio.",
  keywords: [
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Argentina",
  ],
  authors: [{ name: "Ivan Bongiovanni" }],
  creator: "Ivan Bongiovanni",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ivantsx.vercel.app"
  ),
  openGraph: {
    title: "Ivan Bongiovanni | Full-Stack Developer",
    description:
      "Full-Stack Developer especializado en Next.js y React. Construyo aplicaciones web rápidas, escalables y orientadas al negocio.",
    url: "https://ivantsx.vercel.app",
    siteName: "Ivan Bongiovanni",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ivan Bongiovanni | Full-Stack Developer",
    description: "Full-Stack Developer especializado en Next.js y React.",
    creator: "@IvanTsxx",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "WQnMOB9c2UaSmdLlqYeyZ9DXKUgqnxjMcidTtyAjWxM",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html className={inter.className} lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
