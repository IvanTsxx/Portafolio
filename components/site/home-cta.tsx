// components/site/home-cta.tsx
// Primary CTAs on the home hero — PortalLink so navigation uses the portal.
'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'

const CTAS = [
  { href: '/work',  label: 'Work',  routeLabel: 'WORK',  primary: true  },
  { href: '/notes', label: 'Notes', routeLabel: 'NOTES', primary: false },
  { href: '/lab',   label: 'Lab',   routeLabel: 'LAB',   primary: false },
] as const

export function HomeCta() {
  return (
    <nav className="flex items-center gap-6 pt-2" aria-label="Primary navigation">
      {CTAS.map(({ href, label, routeLabel, primary }) => (
        <PortalLink
          key={href}
          href={href}
          label={routeLabel}
          className={
            primary
              ? 'font-mono uppercase text-ax-bright border-b border-ax-line hover:border-ax-bright hover:text-ax-signal transition-colors'
              : 'font-mono uppercase text-ax-mid hover:text-ax-bright transition-colors'
          }
          style={{
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.12em',
            transitionDuration: 'var(--dur-micro)',
          }}
        >
          {label}
        </PortalLink>
      ))}
    </nav>
  )
}
