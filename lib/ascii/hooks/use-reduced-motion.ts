// lib/ascii/hooks/use-reduced-motion.ts
// Detects prefers-reduced-motion. SSR + hydration use the same snapshot
// (reduced=true) so motion props don't diverge; real preference applies after.
'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A11y-safe default until the client can read the real preference. */
function getServerSnapshot() {
  return true
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
