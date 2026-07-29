'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'
import { cn } from '@/lib/utils'

export function NoteBackLink() {
  return (
    <PortalLink href="/notes" label="NOTES" className={cn(portal.link, 'mt-0')}>
      ← All notes
    </PortalLink>
  )
}
