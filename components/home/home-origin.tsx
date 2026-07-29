'use client'

import * as React from 'react'
import { AsciiCanvas } from '@/lib/ascii/components/ascii-canvas'
import { RAMP_TECH } from '@/lib/ascii/ramps'
import type { FieldFn } from '@/lib/ascii/types'
import { IDENTITY } from '@/content/identity'
import { PortalLink } from '@/lib/portal/portal-link'
import { HighlightMark } from '@/components/ui/highlight-mark'

const originField: FieldFn = (x, y, t, _dt, meta) => {
  const cx = x - 0.5
  const cy = y - 0.5
  const r = Math.sqrt(cx * cx + cy * cy)
  const a = Math.atan2(cy, cx)
  // Soft spiral — cerro / valley feel
  let d =
    Math.exp(-r * 2.2) *
    (0.45 + 0.4 * Math.sin(a * 3 - Math.log(r + 0.05) * 7 - t * 0.35))
  if (meta.pointer.active) {
    const dx = x - meta.pointer.x
    const dy = y - meta.pointer.y
    d += Math.exp(-Math.sqrt(dx * dx + dy * dy) * 6) * 0.5
  }
  return Math.max(0, Math.min(1, d))
}

/**
 * Origin section — Tucumán in prose + reactive ASCII field.
 */
export function HomeOrigin() {
  return (
    <section
      id="origin"
      aria-labelledby="origin-heading"
      className="relative grid min-h-[85vh] border-t border-ax-line lg:grid-cols-2"
    >
      <div className="relative order-2 min-h-[40vh] lg:order-1 lg:min-h-0">
        <AsciiCanvas
          fieldFn={originField}
          ramp={RAMP_TECH}
          fps={22}
          className="absolute inset-0 [&_pre]:text-[10px] [&_pre]:leading-[10px] [&_pre]:text-ax-dim"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ax-void/80 lg:bg-gradient-to-l lg:from-transparent lg:to-ax-void/90" />
        <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.14em] text-ax-dim">
          Field · {IDENTITY.location.region}
        </p>
      </div>

      <div className="relative order-1 flex flex-col justify-center gap-5 bg-ax-void px-6 py-16 md:px-10 lg:order-2 lg:py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ax-dim">
          Origin
        </p>
        <h2
          id="origin-heading"
          className="max-w-[16ch] font-sans font-semibold text-ax-bright"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
          }}
        >
          <HighlightMark>From {IDENTITY.location.city}.</HighlightMark>
        </h2>
        <p className="max-w-[42ch] text-[15px] leading-relaxed text-ax-mid">
          I work from the northwest of Argentina — heat, hills, and a long habit of
          making denser systems feel legible. The spiral on the home is not decoration:
          it spells the place, the stack, and the practice.
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="Lexicon">
          {IDENTITY.lexicon.slice(0, 8).map((w) => (
            <li
              key={w}
              className="border border-ax-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ax-mid"
            >
              {w}
            </li>
          ))}
        </ul>
        <PortalLink
          href="/about"
          label="ABOUT"
          className="mt-2 w-fit font-mono text-[11px] uppercase tracking-[0.14em] text-ax-bright underline-offset-4 hover:underline"
        >
          Full profile →
        </PortalLink>
      </div>
    </section>
  )
}
