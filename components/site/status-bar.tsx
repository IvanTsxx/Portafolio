// components/site/status-bar.tsx
// Bottom-left: LOCAL HH:MM · UTC±X indicator.
// Client component: reads time on the client to avoid hydration mismatch.
'use client'

import * as React from 'react'
import { Label } from '@/components/primitives'

function getTimeString(): string {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const offsetHours = -Math.round(now.getTimezoneOffset() / 60)
  const sign = offsetHours >= 0 ? '+' : ''
  return `LOCAL ${hh}:${mm} · UTC${sign}${offsetHours}`
}

export function StatusBar() {
  // Start with null to avoid SSR mismatch; populate on client
  const [time, setTime] = React.useState<string | null>(null)

  React.useEffect(() => {
    setTime(getTimeString())
    // Update every 30 seconds — no need for per-minute precision
    const id = setInterval(() => setTime(getTimeString()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="fixed bottom-4 left-4 z-[50] pointer-events-none"
      aria-label="Current time"
    >
      <Label
        tone="dim"
        as="span"
        className="tabular-nums"
        // Suppress hydration warning: time will differ between server and client
        suppressHydrationWarning
      >
        {time ?? '\u00A0'}
      </Label>
    </div>
  )
}
