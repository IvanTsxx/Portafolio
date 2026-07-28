// components/site/footer.tsx
// ASCII art footer: figlet-style name in large mono block characters + navigation links.
// Rendered as static text — no animation, no canvas.
import * as React from 'react'
import Link from 'next/link'
import { Container } from '@/components/primitives/container'
import { Row } from '@/components/primitives/stack'
import { Label } from '@/components/primitives/label'
import { Text } from '@/components/primitives/text'

// Simplified figlet-style "AX" in monospace box-drawing characters.
// Each character is 5 rows × 8 cols, hand-crafted for the mono grid.
const ASCII_NAME = `
 █████╗ ██╗  ██╗
██╔══██╗╚██╗██╔╝
███████║ ╚███╔╝ 
██╔══██║ ██╔██╗ 
██║  ██║██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝`.trim()

const FOOTER_NAV = [
  { href: '/work',  label: 'WORK' },
  { href: '/lab',   label: 'LAB' },
  { href: '/notes', label: 'NOTES' },
  { href: '/about', label: 'ABOUT' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t border-ax-line bg-ax-ink mt-auto"
      aria-label="Site footer"
    >
      <Container size="grid" className="py-12 sm:py-16">
        {/* ASCII name block */}
        <pre
          className="font-mono text-[0.5rem] sm:text-[0.7rem] leading-[1.1] tracking-[0] text-ax-dim select-none overflow-hidden mb-8"
          aria-hidden="true"
        >
          {ASCII_NAME}
        </pre>

        {/* Footer nav + copyright row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <Row as="ul" gap={6} wrap>
              {FOOTER_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-ax-dim hover:text-ax-bright transition-colors duration-[90ms] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ax-signal"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </Row>
          </nav>

          {/* Meta */}
          <Text variant="mono" size="xs" tone="dim" as="p">
            {year} · BUILT WITH NEXT.JS · GENERATIVE ASCII ENGINE
          </Text>
        </div>
      </Container>
    </footer>
  )
}
