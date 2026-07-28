// lib/ascii/components/ascii-rule.tsx
// A single-row ASCII divider that fills its container width.
// Animated version slowly shifts the pattern; static version in reduced-motion.
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAsciiField } from '../hooks/use-ascii-field'
import { useReducedMotion } from '../hooks/use-reduced-motion'
import type { FieldFn } from '../types'
import { RAMP_TECH } from '../ramps'
import { ditherLine } from '../utils/dither'

// A 1-row field: density oscillates left-to-right with slow time drift
const ruleFieldFn: FieldFn = (x, _y, t) => {
  return 0.5 + 0.5 * Math.sin(x * 12 - t * 0.6)
}

export interface AsciiRuleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** If true, renders a dithered Bayer pattern instead of animated wave */
  dither?: boolean
  /** height in px — rules are always 1 row tall */
  rowHeight?: number
}

export function AsciiRule({ dither = false, rowHeight = 14, className, ...props }: AsciiRuleProps) {
  const rm = useReducedMotion()

  const { ref, snapshot } = useAsciiField({
    fieldFn:  ruleFieldFn,
    ramp:     RAMP_TECH,
    charHeight: rowHeight,
    maxCells:   800,
    reducedMotion: rm || dither,
  })

  // Static dither pattern — computed once, no rAF needed
  const ditherContent = React.useMemo(() => {
    // Estimate ~120 cols for the static render; will reflow on client
    return ditherLine(0, 120, '─')
  }, [])

  return (
    <div
      className={cn('w-full overflow-hidden', className)}
      style={{ height: `${rowHeight}px` }}
      aria-hidden="true"
      {...props}
    >
      {dither ? (
        <pre className="ascii-pre w-full h-full text-ax-dim">{ditherContent}</pre>
      ) : (
        <pre
          ref={ref}
          className="ascii-pre w-full h-full text-ax-dim"
          suppressHydrationWarning
        >
          {snapshot}
        </pre>
      )}
    </div>
  )
}
