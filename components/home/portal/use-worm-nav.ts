'use client'

import * as React from 'react'
import { DESTINATIONS, type DestId } from './content'
import type { AsciiWorldApi } from './gl/ascii-world'

export type TravelPhase = 'surface' | 'transit' | 'landed'

type NavSnap = {
  active: DestId
  hover: DestId
  inside: DestId | null
  phase: TravelPhase
  busy: boolean
}

function moodFor(id: DestId): number {
  return DESTINATIONS.find((d) => d.id === id)?.mood ?? 0
}

/**
 * Navigation + hold charge.
 * Charge lives in a ref (wheel paints it via rAF) — no React storm during hold/travel.
 * Land settles with ONE state write after GPU travel finishes.
 */
export function useWormNav(apiRef: React.MutableRefObject<AsciiWorldApi | null>) {
  const [nav, setNav] = React.useState<NavSnap>({
    active: 'home',
    hover: 'home',
    inside: null,
    phase: 'surface',
    busy: false,
  })
  const navRef = React.useRef(nav)
  navRef.current = nav

  const chargeRef = React.useRef(0)
  const holdRef = React.useRef<DestId | null>(null)
  const holdRaf = React.useRef(0)
  const busyRef = React.useRef(false)

  const reduced = React.useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const onHover = React.useCallback((id: DestId) => {
    setNav((n) => (n.hover === id ? n : { ...n, hover: id }))
  }, [])

  const clearCharge = React.useCallback(() => {
    chargeRef.current = 0
    apiRef.current?.setCharge(0)
  }, [apiRef])

  const travel = React.useCallback(
    (id: DestId) => {
      if (busyRef.current) return
      const cur = navRef.current
      const goingHome = id === 'home'

      if (!goingHome && cur.inside === id && cur.phase === 'landed') {
        clearCharge()
        return
      }
      if (goingHome && cur.phase === 'surface') {
        clearCharge()
        setNav((n) => ({ ...n, active: 'home', hover: 'home' }))
        return
      }

      const fromCharge = chargeRef.current
      busyRef.current = true
      holdRef.current = null
      cancelAnimationFrame(holdRaf.current)

      // One React write: hide chamber + mark transit (before tunnel)
      setNav((n) => ({
        ...n,
        phase: 'transit',
        inside: null,
        busy: true,
        hover: id,
      }))

      const api = apiRef.current
      if (!api) {
        busyRef.current = false
        setNav({
          active: goingHome ? 'home' : id,
          hover: goingHome ? 'home' : id,
          inside: goingHome ? null : id,
          phase: goingHome ? 'surface' : 'landed',
          busy: false,
        })
        return
      }

      api.cancelTravel()
      api.startTravel({
        duration: reduced ? 200 : 900,
        fromCharge,
        landMood: goingHome ? 0 : moodFor(id),
        returning: goingHome,
        onDone: () => {
          clearCharge()
          busyRef.current = false
          // Single commit — chamber mounts here, after tunnel GPU work is done
          React.startTransition(() => {
            setNav({
              active: goingHome ? 'home' : id,
              hover: goingHome ? 'home' : id,
              inside: goingHome ? null : id,
              phase: goingHome ? 'surface' : 'landed',
              busy: false,
            })
          })
        },
      })
    },
    [apiRef, clearCharge, reduced],
  )

  const holdStart = React.useCallback(
    (id: DestId) => {
      if (busyRef.current) return
      holdRef.current = id
      setNav((n) => (n.hover === id ? n : { ...n, hover: id }))
      const need = reduced ? 100 : 340
      const t0 = performance.now()
      const tick = (now: number) => {
        if (holdRef.current !== id) return
        const p = Math.min(1, (now - t0) / need)
        const eased = p * p * (3 - 2 * p)
        chargeRef.current = eased
        apiRef.current?.setCharge(eased)
        if (p >= 1) {
          holdRef.current = null
          travel(id)
          return
        }
        holdRaf.current = requestAnimationFrame(tick)
      }
      holdRaf.current = requestAnimationFrame(tick)
    },
    [apiRef, reduced, travel],
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

  const surface = React.useCallback(() => {
    if (navRef.current.phase === 'surface' || busyRef.current) return
    chargeRef.current = 0
    travel('home')
  }, [travel])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(holdRaf.current)
      apiRef.current?.cancelTravel()
    },
    [apiRef],
  )

  return {
    ...nav,
    chargeRef,
    onHover,
    holdStart,
    holdEnd,
    surface,
  }
}
