// lib/ascii/hooks/use-ascii-field.ts
// Core field hook. Contract:
//   - ref attaches to <pre>; the hook mutates textContent directly — zero React re-renders per frame
//   - snapshot: a static AsciiFrame for SSR and reduced-motion, calculated once at t=0
//   - controls: pause / resume / setParams
//
// The hook evaluates the FieldFn once per cell per frame. FieldFn must be O(1).
// Grid re-measurement happens on resize with 150ms debounce (useAsciiGrid).
'use client'

import * as React from 'react'
import type { AsciiFrame, AsciiGridOptions, FieldFn, UseAsciiFieldResult } from '../types'
import { useAsciiGrid } from './use-ascii-grid'
import { useAsciiPointer } from './use-ascii-pointer'
import { useAsciiFrame } from './use-ascii-frame'

export interface UseAsciiFieldOptions extends AsciiGridOptions {
  fieldFn:   FieldFn
  ramp:      string
  seed?:     number
  fps?:      number
  reducedMotion?: boolean
}

let _fieldIdCounter = 0

/**
 * The corrected hook contract:
 *   ref      → attach to <pre> — hook writes textContent, no React re-render per frame
 *   snapshot → static string for SSR / reduced-motion (computed once at t=0)
 *   controls → pause / resume / setParams
 */
export function useAsciiField(options: UseAsciiFieldOptions): UseAsciiFieldResult {
  const {
    fieldFn,
    ramp,
    seed = 0,
    fps,
    reducedMotion = false,
    ...gridOptions
  } = options

  const preRef        = React.useRef<HTMLPreElement | null>(null)
  const containerRef  = React.useRef<HTMLDivElement | null>(null)
  const pausedRef     = React.useRef(false)
  const paramsRef     = React.useRef<Record<string, unknown>>({})
  const fieldFnRef    = React.useRef<FieldFn>(fieldFn)
  const rampRef       = React.useRef<string>(ramp)
  const idRef         = React.useRef(`field-${++_fieldIdCounter}`)

  fieldFnRef.current = fieldFn
  rampRef.current    = ramp

  // Use the pre element's parent as the resize container
  const containerRefTyped = containerRef as React.RefObject<HTMLElement | null>
  const grid = useAsciiGrid(containerRefTyped, gridOptions)

  // Pointer tracking
  const pointerRef = useAsciiPointer(containerRefTyped)

  // Build the snapshot (t=0) whenever grid changes
  const snapshot = React.useMemo<AsciiFrame>(() => {
    if (!grid.ready) return ''
    const { cols, rows } = grid
    const lines: string[] = []
    for (let py = 0; py < rows; py++) {
      let line = ''
      for (let px = 0; px < cols; px++) {
        const x = px / Math.max(1, cols - 1)
        const y = py / Math.max(1, rows - 1)
        const d = fieldFnRef.current(x, y, 0, 0, {
          cols,
          rows,
          px,
          py,
          pointer: { x: 0.5, y: 0.5, active: false },
        })
        const clamped = Math.max(0, Math.min(1, d))
        const r = rampRef.current
        line += r[Math.floor(clamped * (r.length - 1))]
      }
      lines.push(line)
    }
    return lines.join('\n')
  }, [grid])

  // Write snapshot to <pre> when in reduced-motion mode
  React.useEffect(() => {
    if (reducedMotion && preRef.current && snapshot) {
      preRef.current.textContent = snapshot
    }
  }, [reducedMotion, snapshot])

  // rAF callback — writes directly to DOM, zero React state
  const rafCb = React.useCallback((t: number, dt: number) => {
    if (pausedRef.current || reducedMotion) return
    const pre = preRef.current
    if (!pre) return
    if (!grid.ready) return

    const { cols, rows } = grid
    const pointer = pointerRef.current
    const r = rampRef.current
    const fn = fieldFnRef.current

    let text = ''
    for (let py = 0; py < rows; py++) {
      if (py > 0) text += '\n'
      for (let px = 0; px < cols; px++) {
        const x = px / Math.max(1, cols - 1)
        const y = py / Math.max(1, rows - 1)
        const d = fn(x, y, t, dt, { cols, rows, px, py, pointer })
        const clamped = Math.max(0, Math.min(1, d))
        text += r[Math.floor(clamped * (r.length - 1))]
      }
    }

    pre.textContent = text
  }, [grid, pointerRef, reducedMotion])

  useAsciiFrame(rafCb, containerRefTyped, {
    fps,
    paused: reducedMotion || pausedRef.current,
  })

  // Combine pre ref and container ref into one callback ref
  const combinedRef = React.useCallback((el: HTMLPreElement | null) => {
    preRef.current = el
    containerRef.current = el?.parentElement as HTMLDivElement | null
  }, [])

  const controls = React.useMemo(() => ({
    pause() { pausedRef.current = true },
    resume() { pausedRef.current = false },
    setParams(p: Partial<Record<string, unknown>>) {
      Object.assign(paramsRef.current, p)
    },
  }), [])

  return {
    ref:      combinedRef as unknown as React.RefObject<HTMLPreElement | null>,
    snapshot,
    controls,
  }
}
