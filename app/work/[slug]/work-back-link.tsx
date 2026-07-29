'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'

export function WorkBackLink() {
  return (
    <PortalLink href="/work" label="WORK" className="portal-link" style={{ marginTop: 0 }}>
      ← All work
    </PortalLink>
  )
}
