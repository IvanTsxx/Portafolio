// lib/ascii/fields/phyllotaxis.ts
// Phyllotaxis (golden angle) field — sunflower spiral.
//
// Algorithm (corrected per brief):
// 1. Precalculate N points once → stamp each into a Float32Array density buffer
//    using a radial falloff kernel. Complexity: O(N * kernelRadius²).
// 2. Per-frame pass: O(cols*rows) — just read buffer, modulate by t and pointer.
// 3. Buffer recomputed only on resize (with 150ms debounce via useAsciiGrid).
//
// No per-frame nearest-neighbor search. No O(N*cells) per frame.

import type { FieldFn } from '../types'

const PHI = (1 + Math.sqrt(5)) / 2
const GOLDEN_ANGLE = (2 - PHI) * Math.PI * 2  // ≈ 2.399963

export interface PhyllotaxisParams {
  n?:          number   // number of spiral arms; default 400
  scale?:      number   // spiral scale; default 0.47
  speed?:      number   // rotation speed rad/s; default 0.08
  pulseSpeed?: number   // density pulse speed; default 0.5
  kernelR?:    number   // falloff kernel radius in cells; default 2.5
  pointerR?:   number   // pointer influence radius (normalized); default 0.25
}

/**
 * Builds the static density buffer.
 * Call once per resize, not per frame.
 */
export function buildPhyllotaxisBuffer(
  cols: number,
  rows: number,
  n    = 400,
  scale = 0.47,
  kernelR = 2.5
): Float32Array {
  const buf = new Float32Array(cols * rows)

  // Center in grid space
  const cx = cols * 0.5
  const cy = rows * 0.5

  // The kernel is elliptical to account for character aspect ratio (~0.55)
  const aspect = 0.55
  const kr = kernelR

  for (let i = 0; i < n; i++) {
    // Phyllotaxis formula: r² = i / n, angle = i * GOLDEN_ANGLE
    const r     = Math.sqrt(i / n) * scale * Math.min(cols, rows) * 0.5
    const theta = i * GOLDEN_ANGLE

    // Point in grid-space (cols, rows)
    const px = cx + r * Math.cos(theta)
    const py = cy + r * Math.sin(theta) * aspect

    // Stamp radial falloff kernel into buffer
    const ix0 = Math.max(0, Math.floor(px - kr))
    const ix1 = Math.min(cols - 1, Math.ceil(px + kr))
    const iy0 = Math.max(0, Math.floor(py - kr))
    const iy1 = Math.min(rows - 1, Math.ceil(py + kr))

    for (let gy = iy0; gy <= iy1; gy++) {
      for (let gx = ix0; gx <= ix1; gx++) {
        const dx  = (gx - px) / kr
        const dy  = (gy - py) / (kr * aspect)
        const d2  = dx * dx + dy * dy
        if (d2 > 1) continue
        const contrib = 1 - d2  // linear falloff
        const idx = gy * cols + gx
        if (buf[idx] < contrib) buf[idx] = contrib  // take max, not sum
      }
    }
  }

  return buf
}

/**
 * Create a FieldFn from a pre-built buffer.
 * bufferRef.current must be updated externally on resize.
 */
export function makePhyllotaxisField(
  bufferRef: { current: Float32Array | null },
  params: PhyllotaxisParams = {}
): FieldFn {
  const {
    speed      = 0.08,
    pulseSpeed = 0.5,
    pointerR   = 0.25,
  } = params

  return (x, y, t, _dt, { cols, rows, px, py, pointer }) => {
    const buf = bufferRef.current
    if (!buf || buf.length !== cols * rows) return 0

    // Read base density from buffer
    let density = buf[py * cols + px]

    // Slow rotation — reindex by rotating around center
    const cx = 0.5, cy = 0.5
    const dx = x - cx, dy = y - cy
    const angle  = Math.atan2(dy, dx) + t * speed
    const radius = Math.sqrt(dx * dx + dy * dy)
    const rx = cx + radius * Math.cos(angle)
    const ry = cy + radius * Math.sin(angle)

    // Sample buffer at rotated position
    const rpx = Math.floor(Math.max(0, Math.min(cols - 1, rx * (cols - 1))))
    const rpy = Math.floor(Math.max(0, Math.min(rows - 1, ry * (rows - 1))))
    density = buf[rpy * cols + rpx]

    // Slow pulse modulation
    density *= 0.6 + 0.4 * Math.sin(t * pulseSpeed + radius * 8)

    // Pointer influence: boost density near pointer
    if (pointer.active) {
      const pdx = x - pointer.x
      const pdy = y - pointer.y
      const pr2 = pdx * pdx + pdy * pdy
      if (pr2 < pointerR * pointerR) {
        const lift = (1 - Math.sqrt(pr2) / pointerR) * 0.5
        density = Math.min(1, density + lift)
      }
    }

    return density
  }
}

/** Static snapshot for SSR and reduced-motion */
export function phyllotaxisStaticFrame(cols: number, rows: number, ramp: string): string {
  const buf = buildPhyllotaxisBuffer(cols, rows)
  const lines: string[] = []
  for (let py = 0; py < rows; py++) {
    let line = ''
    for (let px = 0; px < cols; px++) {
      const d = buf[py * cols + px]
      line += ramp[Math.floor(Math.max(0, Math.min(1, d)) * (ramp.length - 1))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}
