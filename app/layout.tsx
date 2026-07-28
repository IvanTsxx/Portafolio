// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { StatusBar } from '@/components/site/status-bar'
import { ContactPanel } from '@/components/site/contact-panel'

// ─── Fonts ───────────────────────────────────────────────────────────────────
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'AX — Frontend Developer',
    template: '%s · AX',
  },
  description:
    'Frontend developer building at the edge of generative systems, agent tooling, and whatever ships next. Next.js · TypeScript · AI SDK · eve.',
  keywords: ['frontend', 'developer', 'Next.js', 'TypeScript', 'AI SDK', 'generative', 'ASCII'],
  authors: [{ name: 'AX' }],
  creator: 'AX',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'AX — Frontend Developer',
    description:
      'Frontend developer building at the edge of generative systems, agent tooling, and whatever ships next.',
    siteName: 'AX Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AX — Frontend Developer',
    description:
      'Frontend developer building at the edge of generative systems, agent tooling, and whatever ships next.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-ax-void`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/* Global chrome — RSC, no client boundary at layout level */}
        <Navbar />
        <StatusBar />
        <ContactPanel />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        <Footer />

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
