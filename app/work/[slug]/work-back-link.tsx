// app/work/[slug]/work-back-link.tsx
'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'

export function WorkBackLink() {
  return (
    <PortalLink
      href="/work"
      label="WORK"
      className="font-mono text-ax-dim hover:text-ax-bright transition-colors inline-flex items-center gap-2"
      style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', transitionDuration: 'var(--dur-micro)' }}
    >
      <span aria-hidden="true">←</span>
      All work
    </PortalLink>
  )
}
