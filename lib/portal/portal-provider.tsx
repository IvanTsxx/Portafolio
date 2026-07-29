// lib/portal/portal-provider.tsx
// Persistent ASCII cosmos + wormhole route transitions on the SAME canvas.
'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useReducedMotion } from '@/lib/ascii/hooks/use-reduced-motion'
import { cue } from '@/lib/cuelume'
import { HalfWheel } from '@/components/home/portal/half-wheel'
import {
  DESTINATIONS,
  type DestId,
  type PortalTheme,
} from '@/components/home/portal/content'
import type { AsciiWorldApi } from '@/components/home/portal/gl/ascii-world'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import '@/components/site/portal-shell.css'

const AsciiWorld = dynamic(
  () =>
    import('@/components/home/portal/gl/ascii-world').then((m) => m.AsciiWorld),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: 'absolute', inset: 0, background: '#0c0b0a' }} />
    ),
  },
)

export type PortalPhase = 'idle' | 'traveling' | 'arriving'

export interface PortalContextValue {
  trigger: (
    href: string,
    label?: string,
    opts?: { mood?: number; fromCharge?: number },
  ) => void
  state: PortalPhase
  landId: number
  apiRef: React.MutableRefObject<AsciiWorldApi | null>
  theme: PortalTheme
  setTheme: React.Dispatch<React.SetStateAction<PortalTheme>>
  /** Home registers Open chamber; wheel calls this when Open is held on `/` */
  registerOpenLocal: (fn: (() => void) | null) => void
}

const PortalContext = React.createContext<PortalContextValue | null>(null)

export function usePortal(): PortalContextValue {
  const ctx = React.useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be inside PortalProvider')
  return ctx
}

export function moodForHref(href: string): number {
  if (href === '/') return 0
  if (href.startsWith('/work') || href.startsWith('/notes')) return 0.2
  if (href.startsWith('/lab')) return 0.45
  if (href.startsWith('/about')) return 0.7
  return 0.55
}

export function destFromPath(path: string): DestId {
  if (path === '/') return 'home'
  if (path.startsWith('/work') || path.startsWith('/notes')) return 'work'
  if (path.startsWith('/lab')) return 'craft'
  if (path.startsWith('/about')) return 'studio'
  return 'home'
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const rm = useReducedMotion()
  const apiRef = React.useRef<AsciiWorldApi | null>(null)
  const [theme, setTheme] = React.useState<PortalTheme>('dark')
  const [phase, setPhase] = React.useState<PortalPhase>('idle')
  const [landId, setLandId] = React.useState(0)
  const [tripLabel, setTripLabel] = React.useState<string | null>(null)
  const abortRef = React.useRef<(() => void) | null>(null)
  const navFired = React.useRef(false)
  const hrefRef = React.useRef('')
  const openLocalRef = React.useRef<(() => void) | null>(null)
  const phaseRef = React.useRef(phase)
  phaseRef.current = phase

  const registerOpenLocal = React.useCallback((fn: (() => void) | null) => {
    openLocalRef.current = fn
  }, [])

  const finish = React.useCallback((href: string) => {
    const api = apiRef.current
    const home = href === '/'
    if (api) {
      if (home) {
        api.setLand(0)
        api.setLandMood(0)
      } else {
        api.setLand(1)
        api.setLandMood(moodForHref(href))
      }
    }
    setTripLabel(null)
    setLandId((n) => n + 1)
    setPhase('arriving')
    cue('ready')
    const id = window.setTimeout(() => setPhase('idle'), 560)
    abortRef.current = () => clearTimeout(id)
  }, [])

  const trigger = React.useCallback(
    (
      href: string,
      label?: string,
      opts?: { mood?: number; fromCharge?: number },
    ) => {
      if (typeof window !== 'undefined' && window.location.pathname === href) {
        return
      }
      if (phaseRef.current === 'traveling') return

      abortRef.current?.()
      abortRef.current = null
      navFired.current = false
      hrefRef.current = href

      const routeLabel =
        label ??
        (href.replace(/^\//, '').replace(/-/g, ' ').toUpperCase() || 'HOME')
      const mood = opts?.mood ?? moodForHref(href)
      const fromCharge = opts?.fromCharge ?? apiRef.current?.getTravel().charge ?? 0
      const goingHome = href === '/'

      cue('loading')
      setPhase('traveling')
      setTripLabel(routeLabel)

      if (rm) {
        const id = window.setTimeout(() => {
          router.push(href)
          finish(href)
        }, 160)
        abortRef.current = () => clearTimeout(id)
        return
      }

      const api = apiRef.current
      if (!api) {
        router.push(href)
        finish(href)
        return
      }

      api.cancelTravel()
      api.startTravel({
        duration: 900,
        fromCharge,
        landMood: mood,
        returning: goingHome,
        exitClear: goingHome,
        onMid: () => {
          if (navFired.current) return
          navFired.current = true
          router.push(href)
        },
        onDone: () => finish(href),
      })

      abortRef.current = () => api.cancelTravel()
    },
    [finish, rm, router],
  )

  // Persist landed ambient on non-home routes (refresh / soft land)
  React.useEffect(() => {
    if (phase === 'traveling') return
    if (pathname === '/') return
    let raf = 0
    const apply = () => {
      const api = apiRef.current
      if (!api) {
        raf = requestAnimationFrame(apply)
        return
      }
      api.setLand(1)
      api.setLandMood(moodForHref(pathname))
    }
    apply()
    return () => cancelAnimationFrame(raf)
  }, [pathname, phase])

  const ctxValue = React.useMemo<PortalContextValue>(
    () => ({
      trigger,
      state: phase,
      landId,
      apiRef,
      theme,
      setTheme,
      registerOpenLocal,
    }),
    [trigger, phase, landId, theme, registerOpenLocal],
  )

  return (
    <PortalContext.Provider value={ctxValue}>
      <div
        className="portal-shell"
        data-theme={theme}
        data-portal-phase={phase}
        data-portal-land={landId}
      >
        <AsciiWorld
          theme={theme}
          apiRef={apiRef}
          cell={16}
          className="absolute inset-0"
        />

        <AnimatedThemeToggler
          className="portal-theme-btn"
          data-cuelume-toggle
          theme={theme}
          onThemeChange={setTheme}
          variant="circle"
          duration={400}
        />

        {tripLabel && <p className="portal-transit-label">{tripLabel}</p>}

        <div className="portal-shell-content">{children}</div>

        <ShellWheel openLocalRef={openLocalRef} />
      </div>
    </PortalContext.Provider>
  )
}

function ShellWheel({
  openLocalRef,
}: {
  openLocalRef: React.MutableRefObject<(() => void) | null>
}) {
  const pathname = usePathname()
  const { trigger, state, apiRef } = usePortal()
  const active = destFromPath(pathname)
  const [hover, setHover] = React.useState<DestId>(active)
  const chargeRef = React.useRef(0)
  const holdRef = React.useRef<DestId | null>(null)
  const holdRaf = React.useRef(0)
  const busy = state === 'traveling'

  React.useEffect(() => {
    setHover(active)
  }, [active])

  const clearCharge = React.useCallback(() => {
    chargeRef.current = 0
    apiRef.current?.setCharge(0)
  }, [apiRef])

  const commit = React.useCallback(
    (id: DestId) => {
      const dest = DESTINATIONS.find((d) => d.id === id)
      if (!dest) return

      if (id === 'home') {
        if (pathname === '/') {
          clearCharge()
          return
        }
        trigger('/', 'HOME', { fromCharge: chargeRef.current, mood: 0 })
        return
      }

      if (!dest.href) {
        // Open — local chamber only on home
        if (pathname === '/') {
          clearCharge()
          openLocalRef.current?.()
        } else {
          trigger('/', 'HOME', { fromCharge: chargeRef.current, mood: 0 })
        }
        return
      }

      trigger(dest.href, dest.label.toUpperCase(), {
        mood: dest.mood,
        fromCharge: chargeRef.current,
      })
    },
    [apiRef, clearCharge, openLocalRef, pathname, trigger],
  )

  const holdStart = React.useCallback(
    (id: DestId) => {
      if (busy) return
      holdRef.current = id
      setHover(id)
      const need = 340
      const t0 = performance.now()
      const tick = (now: number) => {
        if (holdRef.current !== id) return
        const p = Math.min(1, (now - t0) / need)
        const eased = p * p * (3 - 2 * p)
        chargeRef.current = eased
        apiRef.current?.setCharge(eased)
        if (p >= 1) {
          holdRef.current = null
          commit(id)
          return
        }
        holdRaf.current = requestAnimationFrame(tick)
      }
      holdRaf.current = requestAnimationFrame(tick)
    },
    [apiRef, busy, commit],
  )

  const holdEnd = React.useCallback(() => {
    if (chargeRef.current >= 0.98 || !holdRef.current) return
    holdRef.current = null
    cancelAnimationFrame(holdRaf.current)
    const start = chargeRef.current
    const t0 = performance.now()
    const back = (now: number) => {
      const u = Math.min(1, (now - t0) / 140)
      const v = start * (1 - u)
      chargeRef.current = v
      apiRef.current?.setCharge(v)
      if (u < 1) holdRaf.current = requestAnimationFrame(back)
      else clearCharge()
    }
    holdRaf.current = requestAnimationFrame(back)
  }, [apiRef, clearCharge])

  React.useEffect(
    () => () => cancelAnimationFrame(holdRaf.current),
    [],
  )

  return (
    <HalfWheel
      active={active}
      hover={hover}
      chargeRef={chargeRef}
      disabled={busy}
      onHover={(id) => {
        if (hover !== id) cue('tick', 0.35)
        setHover(id)
      }}
      onHoldStart={holdStart}
      onHoldEnd={holdEnd}
    />
  )
}
