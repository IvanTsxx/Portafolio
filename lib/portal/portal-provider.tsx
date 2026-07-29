// lib/portal/portal-provider.tsx
// Persistent ASCII cosmos + wormhole route transitions on the SAME canvas.
'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useReducedMotion } from '@/lib/ascii/hooks/use-reduced-motion'
import { cue } from '@/lib/cuelume'
import { WheelDock } from '@/components/home/portal/wheel-dock'
import {
  DESTINATIONS,
  type DestId,
  type PortalTheme,
} from '@/components/home/portal/content'
import type { AsciiWorldApi } from '@/components/home/portal/gl/ascii-world'
import { SoundToggle } from '@/components/site/sound-toggle'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { HighlightMark } from '@/components/ui/highlight-mark'
import { portal } from '@/lib/portal/styles'

const AsciiWorld = dynamic(
  () =>
    import('@/components/home/portal/gl/ascii-world').then((m) => m.AsciiWorld),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-p-void" />
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
  /** Resolved portal palette (mirrors next-themes). */
  theme: PortalTheme
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
  if (href.startsWith('/work')) return 0.2
  if (href.startsWith('/notes')) return 0.4
  if (href.startsWith('/lab')) return 0.6
  if (href.startsWith('/about')) return 0.8
  return 0.55
}

export function destFromPath(path: string): DestId {
  if (path === '/') return 'home'
  if (path.startsWith('/work')) return 'work'
  if (path.startsWith('/notes')) return 'notes'
  if (path.startsWith('/lab')) return 'lab'
  if (path.startsWith('/about')) return 'about'
  return 'home'
}

/** Prefer next-themes once set; else trust the blocking script's html class. */
function portalThemeFromDom(): PortalTheme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const rm = useReducedMotion()
  const { resolvedTheme } = useTheme()
  // next-themes leaves resolvedTheme undefined after SSR until setTheme() —
  // defaulting that to 'dark' desyncs from the script's html.light class and
  // paints light-on-light portal copy until the user toggles once.
  const [theme, setPortalTheme] = React.useState<PortalTheme>('dark')
  React.useLayoutEffect(() => {
    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      setPortalTheme(resolvedTheme)
      return
    }
    setPortalTheme(portalThemeFromDom())
  }, [resolvedTheme])
  const apiRef = React.useRef<AsciiWorldApi | null>(null)
  const [phase, setPhase] = React.useState<PortalPhase>('idle')
  const [landId, setLandId] = React.useState(0)
  const [trip, setTrip] = React.useState<{ label: string; sub: string } | null>(
    null,
  )
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
    setTrip(null)
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

      const dest = DESTINATIONS.find((d) => d.href === href)
      const routeLabel =
        label ??
        dest?.label ??
        (href.replace(/^\//, '').replace(/-/g, ' ') || 'Home')
      const mood = opts?.mood ?? moodForHref(href)
      const fromCharge = opts?.fromCharge ?? apiRef.current?.getTravel().charge ?? 0
      const goingHome = href === '/'

      cue('loading')
      setPhase('traveling')
      setTrip({ label: routeLabel, sub: dest?.sub ?? 'Tunnel' })

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
      registerOpenLocal,
    }),
    [trigger, phase, landId, theme, registerOpenLocal],
  )

  return (
    <PortalContext.Provider value={ctxValue}>
      <div
        className={portal.shell}
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

        <div className={portal.chromeControls} role="group" aria-label="Display controls">
          <SoundToggle className={portal.chromeBtn} />
          <AnimatedThemeToggler
            className={portal.chromeBtn}
            data-cuelume-toggle
            variant="circle"
            duration={400}
          />
        </div>

        {trip && (
          <div className={portal.transit} aria-live="polite" aria-atomic="true">
            <div className={portal.transitMark}>
              <p className={portal.transitEyebrow}>{trip.sub}</p>
              <h2 className={portal.transitTitle}>
                <HighlightMark isView={false} iterations={1} multiline>
                  {trip.label}
                </HighlightMark>
              </h2>
            </div>
          </div>
        )}

        <div className={portal.shellContent}>{children}</div>

        <ShellWheel />
      </div>
    </PortalContext.Provider>
  )
}

function ShellWheel() {
  const pathname = usePathname()
  const { trigger, state, apiRef } = usePortal()
  const active = destFromPath(pathname)
  const [hover, setHover] = React.useState<DestId>(active)
  const [holding, setHolding] = React.useState(false)
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
      setHolding(false)
      if (pathname === dest.href || (id === 'home' && pathname === '/')) {
        clearCharge()
        return
      }
      trigger(dest.href, dest.label, {
        mood: dest.mood,
        fromCharge: chargeRef.current,
      })
    },
    [clearCharge, pathname, trigger],
  )

  const holdStart = React.useCallback(
    (id: DestId) => {
      if (busy) return
      cue('press')
      holdRef.current = id
      setHolding(true)
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
    cue('release')
    holdRef.current = null
    setHolding(false)
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
    <WheelDock
      active={active}
      hover={hover}
      chargeRef={chargeRef}
      disabled={busy}
      locked={holding}
      onHover={(id) => {
        if (hover !== id) cue('tick', 0.35)
        setHover(id)
      }}
      onHoldStart={holdStart}
      onHoldEnd={holdEnd}
    />
  )
}
