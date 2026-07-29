// lib/portal/portal-provider.tsx
// Portal transition system.
//
// Sequence (900ms total, split internally):
//   0ms    — overlay mounts, opacity 0→1 in 120ms (--dur-fade)
//  120ms   — ASCII field crossfades in (320ms, --dur-enter)
//  200ms   — route name scramble starts
//  700ms   — scramble resolves to final string
//  800ms   — navigation fires (router.push)
//  900ms   — overlay fades out after new page paint
//
// Double-navigation cancellation: if trigger() is called while a
// transition is already running, the in-flight one is aborted and
// the new destination wins immediately after a brief flash.
//
// Reduced-motion path: overlay fades in/out at --dur-fade (120ms),
// no ASCII field, no scramble. Navigation fires at 120ms.
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useReducedMotion } from '@/lib/ascii/hooks/use-reduced-motion'
import { scrambleFrame }    from './scramble'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PortalContextValue {
  trigger: (href: string, label?: string) => void
  state:   'idle' | 'opening' | 'closing'
}

const PortalContext = React.createContext<PortalContextValue | null>(null)

export function usePortal(): PortalContextValue {
  const ctx = React.useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be inside PortalProvider')
  return ctx
}

// ─── Internal state ──────────────────────────────────────────────────────────

interface PortalState {
  phase:     'idle' | 'opening' | 'closing'
  progress:  number   // 0..1 within the 900ms window
  label:     string   // scrambled route name
  targetHref: string
}

const IDLE: PortalState = {
  phase: 'idle', progress: 0, label: '', targetHref: '',
}

// Timing constants (all in ms, add to 900ms)
const T_FADE_IN    = 120   // overlay fade-in
const T_FIELD_IN   = 320   // ASCII field crossfade starts at 120ms
const T_NAV_FIRE   = 800   // navigation fires
const T_TOTAL      = 900   // full portal duration
const T_RM_TOTAL   = 240   // reduced-motion: in + out

// ─── Provider ────────────────────────────────────────────────────────────────

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const router        = useRouter()
  const rm            = useReducedMotion()
  const [ps, setPs]   = React.useState<PortalState>(IDLE)

  // Abort controller ref: cancel in-flight animation on double-nav
  const abortRef      = React.useRef<(() => void) | null>(null)
  const navFiredRef   = React.useRef(false)

  const trigger = React.useCallback((href: string, label?: string) => {
    // Cancel any in-flight transition
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }

    const routeLabel =
      label ?? (href.replace(/^\//, '').replace(/-/g, ' ').toUpperCase() || 'HOME')
    let cancelled = false
    navFiredRef.current = false

    abortRef.current = () => { cancelled = true }

    if (rm) {
      // Reduced-motion: fast fade, no ASCII, navigate immediately
      setPs({ phase: 'opening', progress: 0, label: routeLabel, targetHref: href })
      const id = setTimeout(() => {
        if (cancelled) return
        router.push(href)
        setPs(IDLE)
      }, T_RM_TOTAL)
      abortRef.current = () => { cancelled = true; clearTimeout(id) }
      return
    }

    const start = performance.now()
    const seed  = Math.floor(Math.random() * 100000)

    function tick(now: number) {
      if (cancelled) return
      const elapsed  = now - start
      const progress = Math.min(elapsed / T_TOTAL, 1)

      // Fire navigation at 800ms
      if (elapsed >= T_NAV_FIRE && !navFiredRef.current) {
        navFiredRef.current = true
        router.push(href)
      }

      const scrambled = scrambleFrame(routeLabel, progress, seed)

      setPs({
        phase:      progress < 1 ? 'opening' : 'closing',
        progress,
        label:      scrambled,
        targetHref: href,
      })

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setPs(IDLE)
        abortRef.current = null
      }
    }

    setPs({ phase: 'opening', progress: 0, label: routeLabel, targetHref: href })
    requestAnimationFrame(tick)
  }, [rm, router])

  const ctxValue = React.useMemo<PortalContextValue>(() => ({
    trigger,
    state: ps.phase === 'idle' ? 'idle' : ps.phase,
  }), [trigger, ps.phase])

  return (
    <PortalContext.Provider value={ctxValue}>
      {children}
      <PortalOverlay ps={ps} rm={rm} />
    </PortalContext.Provider>
  )
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

function PortalOverlay({ ps, rm }: { ps: PortalState; rm: boolean }) {
  if (ps.phase === 'idle') return null

  const opacity = rm
    ? ps.progress < 0.5 ? ps.progress * 2 : (1 - ps.progress) * 2
    : ps.progress < T_FADE_IN / T_TOTAL
      ? (ps.progress / (T_FADE_IN / T_TOTAL))
      : ps.progress > 0.9
        ? ((1 - ps.progress) / 0.1)
        : 1

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex:          'var(--z-portal)',
        backgroundColor: 'oklch(3% 0 0)',
        opacity:         Math.max(0, Math.min(1, opacity)),
        pointerEvents:   'all',
      }}
      aria-live="assertive"
      aria-label={`Navigating to ${ps.targetHref}`}
    >
      {!rm && (
        <p
          className="font-mono uppercase text-ax-signal"
          style={{
            fontSize:       'var(--text-xs)',
            letterSpacing:  '0.18em',
            opacity:        ps.progress > 0.2 ? Math.min(1, (ps.progress - 0.2) / 0.15) : 0,
          }}
          aria-hidden="true"
        >
          {ps.label}
        </p>
      )}
    </div>
  )
}
