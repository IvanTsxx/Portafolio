// lib/ascii/hooks/use-ascii-frame.ts
// Registers a callback in the shared rAF loop.
// Automatically pauses when the element leaves the viewport (IntersectionObserver).
'use client'

import * as React from 'react'
import { useRaf, type RafCallback } from '../raf-provider'

let _idCounter = 0

export interface UseAsciiFrameOptions {
  fps?:    number   // throttle to this FPS; undefined = unlimited
  paused?: boolean  // external pause flag (e.g. reduced-motion)
}

/**
 * Registers `callback` in the shared rAF loop.
 * Returns a ref to attach to the element for IntersectionObserver auto-pause.
 */
export function useAsciiFrame(
  callback: RafCallback,
  containerRef: React.RefObject<Element | null>,
  options: UseAsciiFrameOptions = {}
): void {
  const { fps, paused = false } = options
  const raf = useRaf()

  // Stable ID for this instance
  const idRef = React.useRef<string>(`raf-${++_idCounter}`)

  // Track the last frame time for FPS throttling
  const lastFrameRef = React.useRef<number>(0)

  // Wrap the user callback with optional FPS throttle
  const callbackRef = React.useRef<RafCallback>(callback)
  callbackRef.current = callback

  const wrappedCb = React.useCallback<RafCallback>((t, dt) => {
    if (fps) {
      const interval = 1 / fps
      if (t - lastFrameRef.current < interval) return
      lastFrameRef.current = t
    }
    callbackRef.current(t, dt)
  }, [fps])

  const id = idRef.current

  // Register on mount, unregister on unmount
  React.useEffect(() => {
    raf.register(id, wrappedCb)
    return () => raf.unregister(id)
  }, [id, raf, wrappedCb])

  // Respond to external pause flag
  React.useEffect(() => {
    if (paused) raf.pause(id)
    else raf.resume(id)
  }, [id, paused, raf])

  // IntersectionObserver: pause when off-screen
  React.useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) raf.resume(id)
        else raf.pause(id)
      },
      { threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [id, containerRef, raf])
}
