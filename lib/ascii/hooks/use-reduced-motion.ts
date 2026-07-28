// lib/ascii/hooks/use-reduced-motion.ts
// Detects prefers-reduced-motion media query.
// Returns true on the server (safe default: no motion on SSR).
'use client'

import * as React from 'react'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
