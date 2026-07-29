// components/mdx/cache-flow-diagram.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

export interface CacheFlowDiagramProps {
  title: string
  ariaLabel: string
  staleDesc: string
  revalidatingDesc: string
  expiredDesc: string
  arrowText: string
  legendStale: string
  legendRevalidate: string
  legendExpire: string
}

const LEGEND = [
  { key: 'stale', swatch: 'bg-p-bright/18 border-p-bright/40' },
  { key: 'revalidate', swatch: 'bg-p-signal/25 border-p-signal/55' },
  { key: 'expire', swatch: 'bg-p-bright/32 border-p-bright/55' },
] as const

export function CacheFlowDiagram({
  title,
  ariaLabel,
  staleDesc,
  revalidatingDesc,
  expiredDesc,
  arrowText,
  legendStale,
  legendRevalidate,
  legendExpire,
}: CacheFlowDiagramProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const legendLabels = [legendStale, legendRevalidate, legendExpire]

  return (
    <figure
      ref={rootRef}
      data-animating={inView ? '' : undefined}
      className={cn(
        'cache-flow not-typeset my-6 overflow-x-auto',
        'border border-p-bright/14 bg-p-bright/4 p-5 sm:p-6',
        '[text-shadow:0_0_12px_var(--color-p-void)]',
      )}
    >
      <figcaption className={cn(portal.label, 'mb-4')}>{title}</figcaption>

      <svg
        viewBox="0 0 720 188"
        xmlns="http://www.w3.org/2000/svg"
        className="cache-flow-svg w-full max-w-none"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Baseline track */}
        <line
          className="cache-flow-track"
          x1="40"
          y1="96"
          x2="680"
          y2="96"
          strokeWidth="1.5"
        />
        <line
          className="cache-flow-progress"
          x1="40"
          y1="96"
          x2="680"
          y2="96"
          strokeWidth="1.5"
          pathLength={100}
        />

        {/* Phase panels */}
        <g className="cache-flow-phase" data-phase="stale">
          <rect
            x="40"
            y="72"
            width="200"
            height="48"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text
            x="140"
            y="92"
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            STALE
          </text>
          <text
            x="140"
            y="108"
            textAnchor="middle"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
          >
            {staleDesc}
          </text>
        </g>

        <g className="cache-flow-phase" data-phase="revalidating">
          <rect
            x="258"
            y="72"
            width="220"
            height="48"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text
            x="368"
            y="92"
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            REVALIDATING
          </text>
          <text
            x="368"
            y="108"
            textAnchor="middle"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
          >
            {revalidatingDesc}
          </text>
        </g>

        <g className="cache-flow-phase" data-phase="expired">
          <rect
            x="496"
            y="72"
            width="184"
            height="48"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text
            x="588"
            y="92"
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            EXPIRED
          </text>
          <text
            x="588"
            y="108"
            textAnchor="middle"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
          >
            {expiredDesc}
          </text>
        </g>

        {/* Markers */}
        <circle className="cache-flow-node-end" cx="40" cy="96" r="5" />
        <text
          className="cache-flow-label"
          x="40"
          y="146"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          First
        </text>
        <text
          className="cache-flow-label"
          x="40"
          y="157"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          render
        </text>

        <circle className="cache-flow-node" cx="240" cy="96" r="4" />
        <line
          className="cache-flow-tick"
          x1="240"
          y1="66"
          x2="240"
          y2="96"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          className="cache-flow-label"
          x="240"
          y="56"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          stale
        </text>

        <circle className="cache-flow-node" cx="478" cy="96" r="4" />
        <line
          className="cache-flow-tick"
          x1="478"
          y1="66"
          x2="478"
          y2="96"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          className="cache-flow-label"
          x="478"
          y="56"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          revalidate
        </text>

        <circle className="cache-flow-node-end" cx="680" cy="96" r="5" />
        <text
          className="cache-flow-label"
          x="680"
          y="146"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          expire
        </text>

        {/* Feedback loop: new value → update cache */}
        <path
          className="cache-flow-loop"
          d="M368 72 Q368 30 310 30 Q252 30 252 72"
          fill="none"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          pathLength={100}
        />
        <polygon
          className="cache-flow-loop-head"
          points="252,72 248,62 256,64"
        />
        <text
          className="cache-flow-loop-label"
          x="310"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          {arrowText}
        </text>

        {/* Traveling request token */}
        <circle className="cache-flow-token" cx="40" cy="96" r="4.5" />
        <circle
          className="cache-flow-token-ring"
          cx="40"
          cy="96"
          r="8"
          fill="none"
          strokeWidth="1"
        />
      </svg>

      <ul className="mt-4 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
        {LEGEND.map((item, i) => (
          <li key={item.key} className="flex items-center gap-2">
            <span
              className={cn('size-2 shrink-0 border', item.swatch)}
              aria-hidden
            />
            <span className="text-2xs text-p-mid">{legendLabels[i]}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}
