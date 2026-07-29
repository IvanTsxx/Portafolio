// app/portal-test/page.tsx
// Isolated portal test — verify the full 900ms sequence in isolation.
// Accessible at /portal-test (dev helper; not linked from chrome).
'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'

const TEST_ROUTES = [
  { href: '/',      label: 'HOME'  },
  { href: '/work',  label: 'WORK'  },
  { href: '/lab',   label: 'LAB'   },
  { href: '/notes', label: 'NOTES' },
  { href: '/about', label: 'ABOUT' },
]

export default function PortalTestPage() {
  return (
    <div className="pt-24 px-[var(--gutter)] max-w-[var(--max-grid)] mx-auto">
      <p
        className="font-mono uppercase text-ax-dim mb-8"
        style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
      >
        /portal-test — portal sequence harness
      </p>

      <h1
        className="font-sans font-semibold text-ax-bright mb-10"
        style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.035em', lineHeight: '0.97' }}
      >
        Portal transition test
      </h1>

      <p className="font-sans text-ax-mid mb-8" style={{ fontSize: 'var(--text-sm)' }}>
        Click each link. You should see: overlay fade-in → scramble resolves → navigation → overlay fade-out.
        Double-click any link to test cancellation: the first portal should abort and the second should run.
      </p>

      <nav className="flex flex-col gap-3" aria-label="Portal test links">
        {TEST_ROUTES.map(({ href, label }) => (
          <PortalLink
            key={href}
            href={href}
            label={label}
            className="inline-flex items-center gap-3 font-mono text-ax-bright hover:text-ax-signal border-b border-ax-line hover:border-ax-signal transition-colors pb-1 w-fit"
            style={{ fontSize: 'var(--text-sm)', letterSpacing: '0.06em', transitionDuration: 'var(--dur-micro)' }}
          >
            <span className="text-ax-dim" aria-hidden="true">→</span>
            {label}
          </PortalLink>
        ))}
      </nav>

      <div className="mt-16 border-t border-ax-line pt-6">
        <p className="font-mono text-ax-dim" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}>
          Expected: 900ms total · 120ms fade-in · scramble 200ms–700ms · navigate at 800ms · fade-out to 900ms
        </p>
        <p className="font-mono text-ax-dim mt-1" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}>
          Reduced-motion: 240ms total · instant nav at 120ms · no scramble
        </p>
      </div>
    </div>
  )
}
