'use client'

import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'
import { cn } from '@/lib/utils'

export function WorkBackLink() {
  return (
    <PortalLink href="/work" label="WORK" className={cn(portal.link, 'mt-0')}>
      ← All work
    </PortalLink>
  )
}
