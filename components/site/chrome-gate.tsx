'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

/** Hide global chrome on the portal home — it owns the full viewport. */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  if (path === '/') return null
  return <>{children}</>
}
