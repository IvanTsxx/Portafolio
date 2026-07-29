'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { cue } from '@/lib/cuelume'
import type { AsciiWorldApi } from '@/components/home/portal/gl/ascii-world'

const STAR_COUNT = 4
const HIT = 48
const PAD = 12
const MOVE_MS = 900
const easeOut = [0.16, 1, 0.3, 1] as const

type NodeKind = 'diamond' | 'circle' | 'triangle' | 'cross'
const KINDS: NodeKind[] = ['diamond', 'circle', 'triangle', 'cross']

type Star = {
  /** Stable across reshuffles so motion can tween. */
  id: string
  kind: NodeKind
  /** viewport % */
  left: number
  top: number
}

type Rect = { left: number; top: number; right: number; bottom: number }

type Props = {
  apiRef: React.MutableRefObject<AsciiWorldApi | null>
  heroRef: React.RefObject<HTMLElement | null>
}

function clientToCanvasUv(clientX: number, clientY: number) {
  return {
    x: clientX / Math.max(1, window.innerWidth),
    y: 1 - clientY / Math.max(1, window.innerHeight),
  }
}

function overlaps(a: Rect, b: Rect) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  )
}

function blockedZones(hero: HTMLElement | null): Rect[] {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const zones: Rect[] = [
    { left: vw - 120, top: 0, right: vw, bottom: 64 },
    { left: 0, top: vh - 100, right: vw, bottom: vh },
    { left: 0, top: 0, right: 8, bottom: vh },
    { left: vw - 8, top: 0, right: vw, bottom: vh },
  ]

  if (hero) {
    const r = hero.getBoundingClientRect()
    zones.push({
      left: Math.max(0, r.left - 20),
      top: Math.max(0, r.top - 16),
      right: Math.min(vw, r.right + 28),
      bottom: Math.min(vh, r.bottom + 20),
    })
  } else {
    const isNarrow = vw < 768
    zones.push({
      left: 0,
      top: isNarrow ? vh * 0.12 : vh * 0.16,
      right: isNarrow ? vw * 0.92 : vw * 0.48,
      bottom: isNarrow ? vh * 0.72 : vh * 0.78,
    })
  }

  return zones
}

function samplePositions(hero: HTMLElement | null, count: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const blocked = blockedZones(hero)
  const half = HIT / 2
  const out: { left: number; top: number }[] = []
  const used: Rect[] = []

  for (let i = 0; i < count; i++) {
    let placed: { left: number; top: number } | null = null
    for (let attempt = 0; attempt < 80; attempt++) {
      const cx = half + PAD + Math.random() * (vw - HIT - PAD * 2)
      const cy = half + PAD + Math.random() * (vh - HIT - PAD * 2)
      const box: Rect = {
        left: cx - half,
        top: cy - half,
        right: cx + half,
        bottom: cy + half,
      }
      if (blocked.some((z) => overlaps(box, z))) continue
      if (used.some((z) => overlaps(box, z))) continue
      placed = {
        left: (Math.round(cx) / vw) * 100,
        top: (Math.round(cy) / vh) * 100,
      }
      used.push({
        left: box.left - 32,
        top: box.top - 32,
        right: box.right + 32,
        bottom: box.bottom + 32,
      })
      break
    }
    if (placed) out.push(placed)
  }
  return out
}

function NodeGlyph({ kind, active }: { kind: NodeKind; active: boolean }) {
  const strokeProps = {
    fill: 'none' as const,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
  }

  const mark = (key: string) => {
    switch (kind) {
      case 'diamond':
        return <path key={key} d="M12 3L21 12L12 21L3 12Z" />
      case 'circle':
        return <circle key={key} cx="12" cy="12" r="7" />
      case 'triangle':
        return <path key={key} d="M12 4L20 19H4Z" />
      case 'cross':
        return <path key={key} d="M12 4V20M4 12H20" />
      default: {
        const _exhaustive: never = kind
        return _exhaustive
      }
    }
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      aria-hidden
      className="portal-signal-node"
      data-active={active ? 'true' : 'false'}
      shapeRendering="geometricPrecision"
    >
      {/* Crisp outline — token via CSS, not soft glow */}
      <g
        {...strokeProps}
        stroke="var(--signal-outline)"
        strokeWidth={3}
      >
        {mark('halo')}
      </g>
      <g {...strokeProps} stroke="currentColor" strokeWidth={1.75}>
        {mark('fg')}
        {active && kind !== 'cross' ? (
          <circle
            cx="12"
            cy={kind === 'triangle' ? 14 : 12}
            r="1.5"
            fill="currentColor"
            stroke="none"
          />
        ) : null}
      </g>
    </svg>
  )
}

/**
 * Home constellation — SVG nodes + drawn links; catch pulses the shared cosmos.
 * Stable ids so reshuffles tween instead of remounting.
 */
export function HomeConstellation({ apiRef, heroRef }: Props) {
  const prefersReduced = useReducedMotion()
  const [stars, setStars] = React.useState<Star[]>([])
  const [caught, setCaught] = React.useState<string[]>([])
  const [bursting, setBursting] = React.useState(false)
  const caughtCountRef = React.useRef(0)
  caughtCountRef.current = caught.length

  const seedOrMove = React.useCallback(
    (mode: 'seed' | 'move') => {
      const positions = samplePositions(heroRef.current, STAR_COUNT)
      if (positions.length === 0) return

      setStars((prev) => {
        if (mode === 'seed' || prev.length === 0) {
          return positions.map((p, i) => ({
            id: `signal-${i}`,
            kind: KINDS[i % KINDS.length]!,
            left: p.left,
            top: p.top,
          }))
        }
        return prev.map((s, i) => {
          const p = positions[i]
          if (!p) return s
          return { ...s, left: p.left, top: p.top }
        })
      })
      setCaught([])
    },
    [heroRef],
  )

  React.useEffect(() => {
    let cancelled = false
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) seedOrMove('seed')
      })
    })
    const t = window.setTimeout(() => {
      if (!cancelled && caughtCountRef.current === 0) seedOrMove('move')
    }, 220)
    const onResize = () => {
      if (caughtCountRef.current > 0) return
      seedOrMove('move')
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [seedOrMove])

  const pulseAtClient = React.useCallback(
    (clientX: number, clientY: number, strength?: number) => {
      apiRef.current?.pulseRipple(clientToCanvasUv(clientX, clientY), strength)
    },
    [apiRef],
  )

  const finishBurst = React.useCallback(() => {
    if (bursting) return
    setBursting(true)
    cue('bloom')

    const api = apiRef.current
    const nodes = stars.map((s) => ({
      x: (s.left / 100) * window.innerWidth,
      y: (s.top / 100) * window.innerHeight,
    }))
    const cx = nodes.reduce((s, n) => s + n.x, 0) / Math.max(1, nodes.length)
    const cy = nodes.reduce((s, n) => s + n.y, 0) / Math.max(1, nodes.length)

    // Hard hit — only 3 ripple slots; cascade so each wave reads
    const bang = (n: { x: number; y: number }, s: number, delay: number) => {
      window.setTimeout(() => pulseAtClient(n.x, n.y, s), delay)
    }
    bang({ x: cx, y: cy }, prefersReduced ? 1 : 1.4, 0)
    nodes.forEach((n, i) => bang(n, prefersReduced ? 0.9 : 1.25, 45 + i * 55))
    if (!prefersReduced) {
      bang({ x: cx, y: cy }, 1.35, 280)
      nodes.forEach((n, i) => bang(n, 1.15, 320 + i * 45))
    }

    if (api && !prefersReduced) {
      api.setLandMood(1)
      api.setLand(0.92)
      api.setCharge(1)
      window.setTimeout(() => api.setCharge(0), 180)
      window.setTimeout(() => {
        api.setLandMood(0.15)
        api.setLand(0.12)
      }, 520)
      window.setTimeout(() => {
        api.setLandMood(0)
        api.setLand(0)
      }, 1100)
    } else if (api) {
      api.setLandMood(0.55)
      api.setLand(0.4)
      window.setTimeout(() => {
        api.setLandMood(0)
        api.setLand(0)
      }, 450)
    }

    // hold the constellation a beat, then dissolve links + glide
    const clearAt = prefersReduced ? 160 : 520
    const moveAt = prefersReduced ? 200 : 580
    const doneAt = prefersReduced ? 360 : moveAt + MOVE_MS

    window.setTimeout(() => setCaught([]), clearAt)
    window.setTimeout(() => seedOrMove('move'), moveAt)
    window.setTimeout(() => setBursting(false), doneAt)
  }, [
    apiRef,
    bursting,
    prefersReduced,
    pulseAtClient,
    seedOrMove,
    stars,
  ])

  React.useEffect(() => {
    if (stars.length === 0 || bursting) return
    if (caught.length < stars.length) return
    const t = window.setTimeout(finishBurst, 220)
    return () => window.clearTimeout(t)
  }, [bursting, caught, finishBurst, stars.length])

  const byId = React.useMemo(() => {
    const m = new Map(stars.map((s) => [s.id, s]))
    return m
  }, [stars])

  const linkPairs = React.useMemo(() => {
    const pairs: { key: string; a: Star; b: Star }[] = []
    for (let i = 1; i < caught.length; i++) {
      const a = byId.get(caught[i - 1]!)
      const b = byId.get(caught[i]!)
      if (!a || !b) continue
      pairs.push({ key: `${a.id}->${b.id}`, a, b })
    }
    return pairs
  }, [byId, caught])

  if (stars.length === 0) return null

  const moveTransition = prefersReduced
    ? { duration: 0 }
    : { type: 'spring' as const, duration: MOVE_MS / 1000, bounce: 0 }

  return (
    <div
      className="pointer-events-none! absolute inset-0 z-25"
      aria-label="Field signals — connect glyphs to pulse the cosmos"
    >
      {/* Links in catch order — 0–100 viewBox tracks % node positions */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <AnimatePresence>
          {linkPairs.map(({ key, a, b }) => (
            <motion.path
              key={key}
              className="portal-signal-link"
              d={`M ${a.left} ${a.top} L ${b.left} ${b.top}`}
              initial={prefersReduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={
                prefersReduced
                  ? undefined
                  : {
                      pathLength: 0,
                      opacity: 0,
                      transition: { duration: 0.28, ease: easeOut },
                    }
              }
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { duration: 0.42, ease: easeOut }
              }
            />
          ))}
        </AnimatePresence>
      </svg>

      {stars.map((star) => {
        const done = caught.includes(star.id)
        return (
          <motion.button
            key={star.id}
            type="button"
            data-no-ripple
            data-cuelume-press
            data-cuelume-release
            aria-label={done ? 'Signal linked' : 'Link field signal'}
            disabled={done || bursting}
            initial={false}
            animate={{ left: `${star.left}%`, top: `${star.top}%` }}
            transition={moveTransition}
            onClick={(e) => {
              if (done || bursting) return
              const r = e.currentTarget.getBoundingClientRect()
              pulseAtClient(r.left + r.width / 2, r.top + r.height / 2)
              setCaught((prev) => [...prev, star.id])
              cue('tick')
            }}
            className={[
              'pointer-events-auto! absolute flex size-14 -translate-x-1/2 -translate-y-1/2',
              'items-center justify-center border-0 bg-transparent p-0',
              'focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-p-signal',
              'touch-manipulation',
            ].join(' ')}
          >
            <motion.span
              key={done ? `${star.id}-linked` : `${star.id}-idle`}
              className="inline-flex origin-center will-change-transform"
              initial={
                done && !prefersReduced ? { scale: 0.88 } : { scale: 1 }
              }
              animate={{ scale: 1 }}
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : done
                    ? { type: 'spring', duration: 0.48, bounce: 0.28 }
                    : { duration: 0 }
              }
              whileTap={
                prefersReduced || done || bursting
                  ? undefined
                  : { scale: 0.97 }
              }
            >
              <NodeGlyph kind={star.kind} active={done} />
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}
