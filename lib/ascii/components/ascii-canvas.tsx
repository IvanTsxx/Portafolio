// lib/ascii/components/ascii-canvas.tsx
// The display wrapper for a live ASCII field.
// Renders a <pre> for the animation and handles the SSR snapshot.
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAsciiField, type UseAsciiFieldOptions } from '../hooks/use-ascii-field'
import { useReducedMotion } from '../hooks/use-reduced-motion'

export interface AsciiCanvasProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    UseAsciiFieldOptions {
  /** Explicit reduced-motion override; auto-detected if omitted */
  reducedMotion?: boolean
}

/**
 * Self-contained ASCII animation panel.
 * - SSR-safe: renders the t=0 snapshot on the server
 * - Reduced-motion: shows static snapshot, no rAF
 * - IntersectionObserver: auto-pauses when scrolled off-screen
 */
export function AsciiCanvas({
  fieldFn,
  ramp,
  seed,
  fps,
  charWidth,
  charHeight,
  maxCells,
  reducedMotion: reducedMotionProp,
  className,
  ...divProps
}: AsciiCanvasProps) {
  const systemRM = useReducedMotion()
  const rm = reducedMotionProp ?? systemRM

  const { ref, snapshot } = useAsciiField({
    fieldFn,
    ramp,
    seed,
    fps,
    charWidth,
    charHeight,
    maxCells,
    reducedMotion: rm,
  })

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      aria-hidden="true"
      {...divProps}
    >
      <pre
        ref={ref}
        className="ascii-pre absolute inset-0 w-full h-full"
        suppressHydrationWarning
      >
        {snapshot}
      </pre>
    </div>
  )
}
