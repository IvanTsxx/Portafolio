'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'

export function NoteBackLink() {
  return (
    <PortalLink href="/notes" label="NOTES" className="portal-link" style={{ marginTop: 0 }}>
      ← All notes
    </PortalLink>
  )
}
