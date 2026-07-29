'use client'

import * as React from 'react'
import { PortalArrive } from '@/components/site/portal-arrive'

/** Client template — post-tunnel emerge on every navigated route. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PortalArrive>{children}</PortalArrive>
}
