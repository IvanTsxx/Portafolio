// lib/ascii/hooks/use-ascii-pointer.ts
// Tracks pointer position normalized to [0, 1] within a container.
// Applies lerp-based inertia so fields read smoothly.
'use client'

import * as React from 'react'
import type { PointerState } from '../types'

export interface UseAsciiPointerOptions {
  ease?: number  // lerp factor 0..1 per frame; default 0.08
}

/**
 * Returns a ref of the current pointer state.
 * The ref is mutated on each frame — no React state, no re-renders.
 * Attach the returned `containerRef` to the element you want to track.
 */
export function useAsciiPointer(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAsciiPointerOptions = {}
): React.RefObject<PointerState> {
  const { ease = 0.08 } = options

  // Raw target (from events)
  const rawRef = React.useRef<PointerState>({ x: 0.5, y: 0.5, active: false })
  // Smoothed output (updated per rAF)
  const smoothRef = React.useRef<PointerState>({ x: 0.5, y: 0.5, active: false })

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      rawRef.current = {
        x:      (e.clientX - rect.left)  / rect.width,
        y:      (e.clientY - rect.top)   / rect.height,
        active: true,
      }
    }

    function onLeave() {
      rawRef.current = { ...rawRef.current, active: false }
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [containerRef])

  // Lerp smooth in a rAF — separate from the shared loop so it's always
  // up-to-date before field callbacks read it.
  React.useEffect(() => {
    let rafId: number
    function tick() {
      smoothRef.current = {
        x:      smoothRef.current.x + (rawRef.current.x - smoothRef.current.x) * ease,
        y:      smoothRef.current.y + (rawRef.current.y - smoothRef.current.y) * ease,
        active: rawRef.current.active,
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [ease])

  return smoothRef
}
