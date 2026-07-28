// components/site/navbar.tsx
// Floating centered navbar: dither background, 1px border, active item in inverted box.
// Motion: active item background swap (--dur-micro = 90ms, --ease-out).
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Label } from '@/components/primitives'

const NAV_ITEMS = [
  { href: '/',       label: 'AX' },
  { href: '/work',   label: 'WORK' },
  { href: '/lab',    label: 'LAB' },
  { href: '/notes',  label: 'NOTES' },
  { href: '/about',  label: 'ABOUT' },
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
        // Position: fixed, centered at top
        'fixed top-4 left-1/2 -translate-x-1/2 z-[50]',
        // Visual: dither bg + 1px border + 4px radius (ONLY exception in the system)
        'dither-bg border border-ax-line bg-ax-ink/80',
        'rounded-[4px]',
        // Layout
        'flex items-center gap-0',
        // Backdrop blur for depth
        'backdrop-blur-sm',
        // Prevent pointer events on the nav background itself
        'pointer-events-auto'
      )}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              // Base
              'px-3 py-1.5',
              'font-mono text-[0.75rem] uppercase tracking-[0.12em]',
              // Transition: active box swap — dur-micro, ease-out
              'transition-colors',
              '[transition-duration:90ms]',
              '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
              // States
              active
                ? 'bg-ax-bright text-ax-void'
                : 'text-ax-mid hover:text-ax-bright',
              // Focus ring using signal color
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ax-signal',
            )}
          >
            <span className="sr-only">Navigate to </span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
