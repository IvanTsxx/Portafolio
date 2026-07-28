// lib/ascii/hooks/use-ascii-grid.ts
// Measures a container element and returns the ASCII grid dimensions
// in columns and rows, based on actual monospace glyph size.
'use client'

import * as React from 'react'
import type { AsciiGridOptions } from '../types'

const MAX_CELLS = 9_000

export interface AsciiGrid {
  cols:   number
  rows:   number
  ready:  boolean  // false on SSR and before first measurement
}

// Measure monospace glyph dimensions using a hidden span
function measureGlyph(fontVar: string): { w: number; h: number } {
  if (typeof document === 'undefined') return { w: 7, h: 14 }

  const span = document.createElement('span')
  span.setAttribute('aria-hidden', 'true')
  span.style.cssText = [
    'position:fixed',
    'top:-9999px',
    'left:-9999px',
    `font-family:${fontVar}`,
    'font-size:11px',
    'white-space:pre',
    'line-height:1.2',
  ].join(';')
  span.textContent = 'X'
  document.body.appendChild(span)
  const rect = span.getBoundingClientRect()
  document.body.removeChild(span)
  return { w: rect.width || 7, h: rect.height || 14 }
}

/**
 * Measures the container and returns the grid size in characters.
 * Enforces MAX_CELLS by scaling the cell size up if needed.
 * Re-measures on resize with 150ms debounce.
 */
export function useAsciiGrid(
  containerRef: React.RefObject<HTMLElement | null>,
  options: AsciiGridOptions = {}
): AsciiGrid {
  const {
    charWidth:  propW,
    charHeight: propH,
    maxCells = MAX_CELLS,
  } = options

  const [grid, setGrid] = React.useState<AsciiGrid>({ cols: 0, rows: 0, ready: false })

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function measure() {
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const glyph = measureGlyph('var(--font-mono, monospace)')
      let cw = propW ?? glyph.w
      let ch = propH ?? glyph.h

      let cols = Math.floor(rect.width  / cw)
      let rows = Math.floor(rect.height / ch)

      // Enforce cell cap by scaling up
      while (cols * rows > maxCells && cols > 1 && rows > 1) {
        cw *= 1.05
        ch *= 1.05
        cols = Math.floor(rect.width  / cw)
        rows = Math.floor(rect.height / ch)
      }

      cols = Math.max(1, cols)
      rows = Math.max(1, rows)

      setGrid({ cols, rows, ready: true })
    }

    measure()

    let debounceId: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(debounceId)
      debounceId = setTimeout(measure, 150)
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      clearTimeout(debounceId)
    }
  }, [containerRef, propW, propH, maxCells])

  return grid
}
