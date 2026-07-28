// lib/ascii/types.ts
// Shared type contracts for the ASCII engine.

/** Normalized density value 0..1 → maps to a character in the ramp. */
export type Density = number

/**
 * A field function: pure math that maps a grid cell to a density.
 * Called once per cell per frame during field evaluation.
 * Must be O(1) — no iteration inside.
 */
export type FieldFn = (
  x: number,      // normalized X in [0, 1]
  y: number,      // normalized Y in [0, 1]
  t: number,      // elapsed time in seconds
  dt: number,     // frame delta time in seconds
  meta: FieldMeta
) => Density

export interface FieldMeta {
  cols:    number
  rows:    number
  px:      number  // absolute column index 0..cols-1
  py:      number  // absolute row index 0..rows-1
  pointer: PointerState
}

export interface PointerState {
  x:      number   // normalized 0..1
  y:      number   // normalized 0..1
  active: boolean  // whether the pointer is over the element
}

export interface AsciiGridOptions {
  charWidth?:  number  // px; default measured from a hidden span
  charHeight?: number  // px; default measured from a hidden span
  maxCells?:   number  // hard cap; default 9000
}

/** Opaque string of characters — one character per cell, newlines separating rows. */
export type AsciiFrame = string

export type PortalState = 'closed' | 'opening' | 'open' | 'closing'

export interface PortalOrigin {
  x: number  // viewport X in px
  y: number  // viewport Y in px
}

/** A named ramp string — characters from sparse to dense. */
export type RampString = string

/** Controls returned by useAsciiField */
export interface AsciiFieldControls {
  pause(): void
  resume(): void
  setParams(p: Partial<Record<string, unknown>>): void
}

export interface UseAsciiFieldResult {
  ref:      React.RefObject<HTMLPreElement | null>
  snapshot: AsciiFrame
  controls: AsciiFieldControls
}
