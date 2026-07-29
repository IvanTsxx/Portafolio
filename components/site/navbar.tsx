// components/site/navbar.tsx
// Floating centered navbar: dither background, 1px border, active item in inverted box.
// Navigation fires through PortalLink (portal transition on internal links).
// Motion: active item background swap at --dur-micro (90ms).
// The "anticipation" shake on nav interaction is a 180ms micro-animation on :active.
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PortalLink } from '@/lib/portal/portal-link'

const NAV_ITEMS = [
  { href: '/',      label: 'IB',    routeLabel: 'HOME'  },
  { href: '/work',  label: 'WORK',  routeLabel: 'WORK'  },
  { href: '/lab',   label: 'LAB',   routeLabel: 'LAB'   },
  { href: '/notes', label: 'NOTES', routeLabel: 'NOTES' },
  { href: '/about', label: 'ABOUT', routeLabel: 'ABOUT' },
] as const

export function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[50]',
        'dither-bg border border-ax-line bg-ax-ink/80',
        'rounded-[4px]',
        'flex items-center gap-0',
        'backdrop-blur-sm',
        'pointer-events-auto',
      )}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ href, label, routeLabel }) => {
        const active = isActive(href)
        return (
          <PortalLink
            key={href}
            href={href}
            label={routeLabel}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'px-3 py-1.5',
              'font-mono text-[0.75rem] uppercase tracking-[0.12em]',
              'transition-colors',
              '[transition-duration:90ms]',
              '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
              // Anticipation shake on :active (180ms = --dur-state)
              'active:scale-[0.97] active:transition-transform active:[transition-duration:180ms]',
              active
                ? 'bg-ax-bright text-ax-void'
                : 'text-ax-mid hover:text-ax-bright',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ax-signal',
            )}
          >
            <span className="sr-only">Navigate to </span>
            {label}
          </PortalLink>
        )
      })}
    </nav>
  )
}
