'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

function useInViewAnim(threshold = 0.35) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, inView }
}

function FigureShell({
  title,
  children,
  className,
  figureRef,
  animating,
}: {
  title: string
  children: ReactNode
  className?: string
  figureRef: RefObject<HTMLElement | null>
  animating: boolean
}) {
  return (
    <figure
      ref={figureRef}
      data-animating={animating ? '' : undefined}
      className={cn(
        'portal-story not-typeset my-7 overflow-x-auto overflow-y-visible',
        'border-0 bg-transparent p-0',
        '[text-shadow:0_0_12px_var(--color-p-void)]',
        className,
      )}
    >
      <figcaption className={cn(portal.label, 'mb-3')}>{title}</figcaption>
      {children}
    </figure>
  )
}

/** Wormhole metaphor — geometric SVG over soft glass (reads against the cosmos canvas). */
export function WormholeDiagram() {
  const { ref, inView } = useInViewAnim(0.3)
  const uid = useId().replace(/:/g, '')
  const phasesRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = phasesRef.current
    if (!list || !inView) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      list.children[0]
        ?.querySelector('[data-phase]')
        ?.setAttribute('data-active', '')
      return
    }

    let i = 0
    const tick = () => {
      for (let n = 0; n < list.children.length; n++) {
        const label = list.children[n]?.querySelector('[data-phase]')
        if (!(label instanceof HTMLElement)) continue
        if (n === i) label.setAttribute('data-active', '')
        else label.removeAttribute('data-active')
      }
      i = (i + 1) % 4
    }
    tick()
    const id = window.setInterval(tick, 700)
    return () => window.clearInterval(id)
  }, [inView])

  const rings = [22, 40, 58, 78, 100, 124]
  const steps = ['HOLD', 'CHARGE', 'TUNNEL', 'LAND'] as const

  return (
    <FigureShell title="WORMHOLE · 900ms" figureRef={ref} animating={inView}>
      <div
        className={cn(
          'ps-tunnel mx-auto w-full max-w-[36rem]',
          'border border-p-bright/12 bg-p-void/55 p-3 backdrop-blur-[10px] sm:p-4',
          'shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-p-void)_40%,transparent)]',
          'p-light:border-p-bright/10 p-light:bg-p-bright/[0.04] p-light:backdrop-blur-[6px]',
          'p-light:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-p-bright)_6%,transparent)]',
        )}
      >
        <svg
          viewBox="0 0 320 200"
          className="portal-story-wormhole mx-auto block h-auto w-full"
          role="img"
          aria-label="Wormhole tunnel diagram: hold, charge, tunnel, land"
        >
          <defs>
            <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="42%">
              <stop offset="0%" stopColor="var(--color-p-signal)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-p-signal)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle
            className="ps-worm-glow"
            cx="160"
            cy="96"
            r="52"
            fill={`url(#${uid}-glow)`}
          />

          {rings.map((r, i) => (
            <ellipse
              key={r}
              className="ps-worm-ring"
              style={{ ['--i' as string]: i }}
              cx="160"
              cy="96"
              rx={r}
              ry={r * 0.72}
              fill="none"
              stroke="var(--color-p-bright)"
              strokeOpacity={0.18 + i * 0.08}
              strokeWidth={i === rings.length - 1 ? 1.5 : 1}
              strokeDasharray={i % 2 === 0 ? '3 5' : '1.5 4'}
            />
          ))}

          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            const x1 = 160 + Math.cos(rad) * 118
            const y1 = 96 + Math.sin(rad) * 84
            const x2 = 160 + Math.cos(rad) * 26
            const y2 = 96 + Math.sin(rad) * 18
            return (
              <line
                key={deg}
                className="ps-worm-ray"
                style={{ ['--i' as string]: i }}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-p-signal)"
                strokeOpacity="0.5"
                strokeWidth="1"
                strokeLinecap="round"
              />
            )
          })}

          <ellipse
            className="ps-worm-core"
            cx="160"
            cy="96"
            rx="11"
            ry="8"
            fill="none"
            stroke="var(--color-p-signal)"
            strokeWidth="1.6"
          />

          {['.', ':', '+', '*', '#', '@'].map((g, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2
            return (
              <text
                key={g}
                className="ps-worm-glyph"
                style={{ ['--i' as string]: i }}
                x={160 + Math.cos(a) * 58}
                y={96 + Math.sin(a) * 42}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--color-p-bright)"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize="11"
              >
                {g}
              </text>
            )
          })}
        </svg>

        <ol
          ref={phasesRef}
          className="m-0 mt-2 flex list-none items-center justify-center gap-1.5 p-0 sm:gap-2.5"
        >
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-1.5 sm:gap-2.5">
              {i > 0 ? (
                <span className="font-mono text-[9px] text-p-dim/50" aria-hidden>
                  →
                </span>
              ) : null}
              <span
                data-phase
                className={cn(
                  portal.meta,
                  'text-p-dim transition-colors duration-150',
                  'data-[active]:text-p-signal',
                )}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </FigureShell>
  )
}

const BUILD_STEPS = [
  { n: '01', label: 'Base', sub: 'Tokens · Geist · RSC · Bun' },
  { n: '02', label: 'ASCII engine', sub: 'rAF · ramps · <pre>' },
  { n: '03', label: 'Portal 900ms', sub: 'Scramble · cancel · land' },
  { n: '04', label: 'Content', sub: 'Work · notes MDX · about' },
  { n: '05', label: 'Cosmos', sub: 'Shared WebGL field' },
  { n: '06', label: 'Shell', sub: 'Wheel · chambers · chrome' },
] as const

/** Vertical build layers — how the site was stacked. */
export function BuildLayers() {
  const { ref, inView } = useInViewAnim(0.25)

  return (
    <FigureShell title="BUILD LAYERS" figureRef={ref} animating={inView}>
      <ol className="ps-layers m-0 flex list-none flex-col gap-0 p-0">
        {BUILD_STEPS.map((step, i) => (
          <li
            key={step.n}
            className="ps-layer relative flex items-stretch gap-3 py-2.5"
            style={{ ['--i' as string]: i }}
          >
            <div className="relative flex w-8 shrink-0 flex-col items-center">
              <span className="ps-layer-dot z-[1] size-2.5 rounded-full bg-p-signal" />
              {i < BUILD_STEPS.length - 1 ? (
                <span className="ps-layer-rail absolute top-3 bottom-[-0.65rem] w-px bg-p-bright/18" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 border border-p-bright/14 bg-transparent px-3 py-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className={cn(portal.meta, 'text-p-signal')}>{step.n}</span>
                <span className="text-[14px] font-semibold tracking-[-0.02em] text-p-bright">
                  {step.label}
                </span>
              </div>
              <p className="m-0 mt-0.5 font-mono text-[11px] tracking-[0.04em] text-p-dim">
                {step.sub}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </FigureShell>
  )
}

const TOKENS = [
  { name: 'void', dark: '#0c0b0a', light: '#e8e4dc', role: 'Shell' },
  { name: 'bright', dark: '#e8e4dc', light: '#1a1816', role: 'Primary' },
  { name: 'mid', dark: '#cfc9bf', light: '#3a3530', role: 'Secondary' },
  { name: 'dim', dark: '#b8b2aa', light: '#5c564e', role: 'Meta' },
  { name: 'signal', dark: '#e85d2a', light: '#c44a1f', role: 'Accent' },
] as const

/** Portal palette swatches with pulse on signal. */
export function TokenPalette() {
  const { ref, inView } = useInViewAnim()

  return (
    <FigureShell title="PORTAL TOKENS · p-*" figureRef={ref} animating={inView}>
      <ul className="ps-tokens m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-5">
        {TOKENS.map((t, i) => (
          <li
            key={t.name}
            className="ps-token border border-p-bright/14 bg-transparent p-2"
            style={{ ['--i' as string]: i }}
          >
            <div className="mb-2 flex h-10 overflow-hidden border border-p-bright/10">
              <span
                className={cn('w-1/2', t.name === 'signal' && 'ps-token-signal')}
                style={{ background: t.dark }}
                title="dark"
              />
              <span className="w-1/2" style={{ background: t.light }} title="light" />
            </div>
            <p className={cn(portal.meta, 'm-0 text-p-bright')}>{t.name}</p>
            <p className="m-0 mt-0.5 font-mono text-[9px] text-p-dim">{t.role}</p>
          </li>
        ))}
      </ul>
      <p className={cn(portal.meta, 'mb-0 mt-3')}>
        Left = dark · Right = light · Signal ≤ 10% of any viewport
      </p>
    </FigureShell>
  )
}

const DURATIONS = [
  { token: 'micro', ms: 90, w: '10%' },
  { token: 'state', ms: 180, w: '20%' },
  { token: 'fade', ms: 120, w: '13%' },
  { token: 'enter', ms: 320, w: '36%' },
  { token: 'portal', ms: 900, w: '100%' },
] as const

/** Closed duration scale — bars grow on view. */
export function DurationScale() {
  const { ref, inView } = useInViewAnim()

  return (
    <FigureShell title="DURATION SCALE · 5 ONLY" figureRef={ref} animating={inView}>
      <ul className="ps-durs m-0 flex list-none flex-col gap-2.5 p-0">
        {DURATIONS.map((d, i) => (
          <li key={d.token} className="ps-dur" style={{ ['--i' as string]: i }}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className={cn(portal.meta, 'text-p-bright')}>--dur-{d.token}</span>
              <span className="font-mono text-[10px] text-p-dim">{d.ms}ms</span>
            </div>
            <div className="h-1.5 overflow-hidden bg-p-bright/10">
              <span
                className={cn(
                  'ps-dur-bar block h-full',
                  d.token === 'portal' ? 'bg-p-signal' : 'bg-p-bright/55',
                )}
                style={{ ['--w' as string]: d.w }}
              />
            </div>
          </li>
        ))}
      </ul>
    </FigureShell>
  )
}

/** Layered shell architecture — all labels inside the viewBox, no clip. */
export function ShellStack() {
  const { ref, inView } = useInViewAnim(0.3)

  const bands = [
    {
      id: 'chrome',
      label: 'Chrome',
      sub: 'theme · sound',
      tone: 'signal' as const,
      y: 36,
      h: 26,
    },
    {
      id: 'chambers',
      label: 'Chambers',
      sub: 'route float',
      tone: 'bright' as const,
      y: 70,
      h: 56,
    },
    {
      id: 'wheel',
      label: 'Half-wheel',
      sub: 'hold to travel',
      tone: 'signal' as const,
      y: 134,
      h: 26,
    },
  ] as const

  return (
    <FigureShell title="SHELL STACK" figureRef={ref} animating={inView}>
      <svg
        viewBox="0 0 360 176"
        className="portal-story-shell mx-auto block h-auto w-full max-w-[30rem]"
        role="img"
        aria-label="Portal shell layers: AsciiWorld behind, then chambers, chrome, and half-wheel"
      >
        <g className="ps-shell-layer" style={{ ['--i' as string]: 0 }}>
          <rect
            x="12"
            y="28"
            width="176"
            height="140"
            fill="var(--color-p-bright)"
            fillOpacity="0.05"
            stroke="var(--color-p-bright)"
            strokeOpacity="0.28"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <text
            x="12"
            y="18"
            fill="var(--color-p-bright)"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            fontSize="11"
            fontWeight="600"
          >
            AsciiWorld
          </text>
          <text
            x="92"
            y="18"
            fill="var(--color-p-dim)"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize="9"
            letterSpacing="0.06em"
          >
            WebGL cosmos · behind all
          </text>
        </g>

        {bands.map((band, i) => (
          <g
            key={band.id}
            className="ps-shell-layer"
            style={{ ['--i' as string]: i + 1 }}
          >
            <rect
              x="24"
              y={band.y}
              width="152"
              height={band.h}
              fill={
                band.tone === 'signal'
                  ? 'var(--color-p-signal)'
                  : 'var(--color-p-bright)'
              }
              fillOpacity={band.tone === 'signal' ? 0.2 : 0.1}
              stroke="var(--color-p-bright)"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <line
              x1="176"
              y1={band.y + band.h / 2}
              x2="196"
              y2={band.y + band.h / 2}
              stroke="var(--color-p-bright)"
              strokeOpacity="0.28"
              strokeWidth="1"
            />
            <text
              x="202"
              y={band.y + band.h / 2 - 4}
              fill="var(--color-p-bright)"
              fontFamily="var(--font-sans), system-ui, sans-serif"
              fontSize="11"
              fontWeight="600"
            >
              {band.label}
            </text>
            <text
              x="202"
              y={band.y + band.h / 2 + 12}
              fill="var(--color-p-dim)"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize="9"
              letterSpacing="0.06em"
            >
              {band.sub}
            </text>
          </g>
        ))}
      </svg>
    </FigureShell>
  )
}

/** Half-wheel charge metaphor. */
export function WheelChargeDiagram() {
  const { ref, inView } = useInViewAnim(0.35)
  const uid = useId().replace(/:/g, '')

  return (
    <FigureShell title="HALF-WHEEL · CHARGE" figureRef={ref} animating={inView}>
      <svg
        viewBox="0 0 320 160"
        className="portal-story-wheel mx-auto block h-auto w-full max-w-[28rem]"
        role="img"
        aria-label="Half-wheel navigation arc filling with signal charge"
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-p-signal)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-p-signal)" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <path
          d="M 36 132 A 124 124 0 0 1 284 132"
          fill="none"
          stroke="var(--color-p-bright)"
          strokeOpacity="0.18"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          className="ps-wheel-charge"
          d="M 36 132 A 124 124 0 0 1 284 132"
          fill="none"
          stroke={`url(#${uid}-fill)`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="390"
          strokeDashoffset="390"
        />
        {['HOME', 'WORK', 'NOTES', 'LAB', 'ABOUT'].map((label, i) => {
          const t = i / 4
          const ang = Math.PI + t * Math.PI
          const cx = 160 + Math.cos(ang) * 124
          const cy = 132 + Math.sin(ang) * 124
          const lx = 160 + Math.cos(ang) * 98
          const ly = 132 + Math.sin(ang) * 98
          return (
            <g key={label} className="ps-wheel-spoke" style={{ ['--i' as string]: i }}>
              <circle cx={cx} cy={cy} r="3.5" fill="var(--color-p-bright)" fillOpacity="0.55" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--color-p-dim)"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize="7"
                letterSpacing="0.12em"
              >
                {label}
              </text>
            </g>
          )
        })}
        <text
          x="160"
          y="78"
          textAnchor="middle"
          fill="var(--color-p-signal)"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          fontSize="9"
          letterSpacing="0.18em"
          className="ps-wheel-label"
        >
          HOLD
        </text>
      </svg>
    </FigureShell>
  )
}

/** Tiny density field of monospace glyphs pulsing. */
export function AsciiDensityField() {
  const { ref, inView } = useInViewAnim(0.4)
  const rows = 7
  const cols = 28
  const ramp = ' .:-=+*#%@'
  const cells: string[] = []
  for (let y = 0; y < rows; y++) {
    let line = ''
    for (let x = 0; x < cols; x++) {
      const cx = x / (cols - 1) - 0.5
      const cy = y / (rows - 1) - 0.5
      const d = Math.sqrt(cx * cx + cy * cy)
      const idx = Math.min(ramp.length - 1, Math.floor((1 - d * 1.6) * (ramp.length - 1)))
      line += ramp[Math.max(0, idx)]
    }
    cells.push(line)
  }

  return (
    <FigureShell title="DENSITY FIELD · PRE PATH" figureRef={ref} animating={inView}>
      <pre
        className="ps-density m-0 overflow-x-auto text-center font-mono text-[11px] leading-[1.35] tracking-[0.08em] text-p-mid"
        aria-hidden
      >
        {cells.map((line, i) => (
          <span
            key={i}
            className="ps-density-row block"
            style={{ ['--i' as string]: i }}
          >
            {line}
          </span>
        ))}
      </pre>
      <p className={cn(portal.meta, 'mb-0 mt-3 text-center')}>
        Lab / dissolve use character ramps · site field uses WebGL cosmos
      </p>
    </FigureShell>
  )
}
