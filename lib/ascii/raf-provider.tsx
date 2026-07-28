// lib/ascii/raf-provider.tsx
// Shared requestAnimationFrame loop — one rAF for all ASCII fields.
// All animations register a callback; the loop calls them with (t, dt).
// Fields paused by IntersectionObserver contribute zero cost.
'use client'

import * as React from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

export type RafCallback = (t: number, dt: number) => void

interface RafContextValue {
  register:   (id: string, cb: RafCallback) => void
  unregister: (id: string) => void
  pause:      (id: string) => void
  resume:     (id: string) => void
}

// ─── Context ────────────────────────────────────────────────────────────────

const RafContext = React.createContext<RafContextValue | null>(null)

export function useRaf(): RafContextValue {
  const ctx = React.useContext(RafContext)
  if (!ctx) throw new Error('useRaf must be used inside RafProvider')
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function RafProvider({ children }: { children: React.ReactNode }) {
  // Use a ref so the registry never triggers re-renders
  const callbacksRef = React.useRef<Map<string, { cb: RafCallback; paused: boolean }>>(new Map())
  const rafIdRef     = React.useRef<number>(0)
  const lastTRef     = React.useRef<number | null>(null)
  const startTRef    = React.useRef<number | null>(null)

  const loop = React.useCallback((now: number) => {
    if (startTRef.current === null) startTRef.current = now
    if (lastTRef.current === null)  lastTRef.current  = now

    const t  = (now - startTRef.current) / 1000  // seconds since mount
    const dt = Math.min((now - lastTRef.current) / 1000, 0.1) // cap dt at 100ms

    lastTRef.current = now

    callbacksRef.current.forEach(({ cb, paused }) => {
      if (!paused) cb(t, dt)
    })

    rafIdRef.current = requestAnimationFrame(loop)
  }, [])

  React.useEffect(() => {
    rafIdRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [loop])

  const value = React.useMemo<RafContextValue>(() => ({
    register(id, cb) {
      callbacksRef.current.set(id, { cb, paused: false })
    },
    unregister(id) {
      callbacksRef.current.delete(id)
    },
    pause(id) {
      const entry = callbacksRef.current.get(id)
      if (entry) entry.paused = true
    },
    resume(id) {
      const entry = callbacksRef.current.get(id)
      if (entry) entry.paused = false
    },
  }), [])

  return <RafContext.Provider value={value}>{children}</RafContext.Provider>
}
