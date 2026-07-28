// lib/ascii/components/phyllotaxis-canvas.tsx
// Self-contained phyllotaxis ASCII animation.
// Uses the buffer strategy: precalculate once, modulate per-frame O(cols*rows).
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion }          from '../hooks/use-reduced-motion'
import { useAsciiGrid }              from '../hooks/use-ascii-grid'
import { useAsciiFrame }             from '../hooks/use-ascii-frame'
import { useAsciiPointer }           from '../hooks/use-ascii-pointer'
import { buildPhyllotaxisBuffer, makePhyllotaxisField } from '../fields/phyllotaxis'
import { RAMP_CLASSIC }              from '../ramps'
import type { PhyllotaxisParams }    from '../fields/phyllotaxis'

const STATIC_COLS = 120
const STATIC_ROWS = 40

function buildStaticSnapshot(cols: number, rows: number): string {
  const buf = buildPhyllotaxisBuffer(cols, rows)
  const r   = RAMP_CLASSIC
  const lines: string[] = []
  for (let py = 0; py < rows; py++) {
    let line = ''
    for (let px = 0; px < cols; px++) {
      const d = buf[py * cols + px]
      line += r[Math.floor(Math.max(0, Math.min(1, d)) * (r.length - 1))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export interface PhyllotaxisCanvasProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  params?:       PhyllotaxisParams
  reducedMotion?: boolean
}

export function PhyllotaxisCanvas({
  params,
  reducedMotion: reducedMotionProp,
  className,
  ...divProps
}: PhyllotaxisCanvasProps) {
  const systemRM  = useReducedMotion()
  const rm        = reducedMotionProp ?? systemRM

  const wrapRef   = React.useRef<HTMLDivElement>(null)
  const preRef    = React.useRef<HTMLPreElement>(null)
  const bufRef    = React.useRef<Float32Array | null>(null)
  const fieldRef  = React.useRef<ReturnType<typeof makePhyllotaxisField> | null>(null)

  // SSR/reduced-motion snapshot
  const [snapshot] = React.useState(() =>
    buildStaticSnapshot(STATIC_COLS, STATIC_ROWS)
  )

  const wrapRefTyped = wrapRef as React.RefObject<HTMLElement | null>
  const grid         = useAsciiGrid(wrapRefTyped, { maxCells: 9000 })
  const pointerRef   = useAsciiPointer(wrapRefTyped)

  // Rebuild buffer when grid changes
  React.useEffect(() => {
    if (!grid.ready) return
    bufRef.current   = buildPhyllotaxisBuffer(grid.cols, grid.rows, params?.n, params?.scale, params?.kernelR)
    fieldRef.current = makePhyllotaxisField(bufRef, params)
  }, [grid.cols, grid.rows, grid.ready, params])

  // Show snapshot in reduced-motion mode
  React.useEffect(() => {
    if (rm && preRef.current) {
      preRef.current.textContent = snapshot
    }
  }, [rm, snapshot])

  useAsciiFrame((t, dt) => {
    if (rm) return
    const pre  = preRef.current
    const fn   = fieldRef.current
    if (!pre || !fn || !grid.ready) return

    const { cols, rows } = grid
    const pointer        = pointerRef.current
    const r              = RAMP_CLASSIC

    let text = ''
    for (let py = 0; py < rows; py++) {
      if (py > 0) text += '\n'
      for (let px = 0; px < cols; px++) {
        const x  = px / Math.max(1, cols - 1)
        const y  = py / Math.max(1, rows - 1)
        const d  = fn(x, y, t, dt, { cols, rows, px, py, pointer })
        const ci = Math.floor(Math.max(0, Math.min(1, d)) * (r.length - 1))
        text += r[ci]
      }
    }
    pre.textContent = text
  }, wrapRefTyped, { paused: rm })

  return (
    <div
      ref={wrapRef}
      className={cn('relative overflow-hidden', className)}
      aria-hidden="true"
      {...divProps}
    >
      <pre
        ref={preRef}
        className="ascii-pre absolute inset-0 w-full h-full text-ax-dim"
        suppressHydrationWarning
      >
        {snapshot}
      </pre>
    </div>
  )
}
