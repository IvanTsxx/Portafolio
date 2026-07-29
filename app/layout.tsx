// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { RafProvider } from '@/lib/ascii/raf-provider'
import { PortalProvider } from '@/lib/portal/portal-provider'
import { DebugPanel } from '@/components/site/debug-panel'
import { CuelumeBind } from '@/components/site/cuelume-bind'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://bongi.dev'),
  title: {
    default: 'Ivan Bongiovanni — Frontend Developer',
    template: '%s · Ivan Bongiovanni',
  },
  description:
    'Frontend developer at basement studio building generative systems, agent tooling, and product UI. Next.js · TypeScript · AI SDK · eve.',
  keywords: [
    'Ivan Bongiovanni',
    'IvanTsxx',
    'frontend',
    'developer',
    'Next.js',
    'TypeScript',
    'basement studio',
    'AI SDK',
    'generative',
    'ASCII',
  ],
  authors: [{ name: 'Ivan Bongiovanni', url: 'https://bongi.dev' }],
  creator: 'Ivan Bongiovanni',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Ivan Bongiovanni — Frontend Developer',
    description:
      'Frontend developer at basement studio building generative systems, agent tooling, and product UI.',
    siteName: 'Ivan Bongiovanni',
    url: 'https://bongi.dev',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@IvanTsxx',
    title: 'Ivan Bongiovanni — Frontend Developer',
    description:
      'Frontend developer at basement studio building generative systems, agent tooling, and product UI.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} bg-ax-void`}
    >
      <body className="font-sans antialiased overflow-hidden">
        <RafProvider>
          <PortalProvider>
            <CuelumeBind />
            <DebugPanel />
            {children}
          </PortalProvider>
        </RafProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
