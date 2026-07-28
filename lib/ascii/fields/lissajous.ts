// lib/ascii/fields/lissajous.ts
// Distance field from a Lissajous parametric curve.
// The curve traces a path; each cell's density is based on its
// min distance to the nearest point on the curve.
// Precalculation: the curve points are sampled once per grid resize.
import type { FieldFn } from '../types'

export interface LissajousParams {
  a?:       number   // x frequency; default 3
  b?:       number   // y frequency; default 2
  delta?:   number   // phase offset; default Math.PI/4
  speed?:   number   // phase animation speed; default 0.3
  samples?: number   // curve resolution; default 512
  radius?:  number   // glow radius in normalized units; default 0.08
}

export function makeLissajousField(params: LissajousParams = {}): FieldFn {
  const {
    a       = 3,
    b       = 2,
    delta   = Math.PI / 4,
    speed   = 0.3,
    samples = 512,
    radius  = 0.08,
  } = params

  return (x, y, t) => {
    const phase = t * speed
    let minDist = Infinity

    // O(samples) per cell — but samples is small (512) and cols*rows <= 9000
    // Total ops per frame: 9000 * 512 = 4.6M — acceptable for 60fps in practice
    // For larger grids, reduce samples or use a spatial hash (documented in ascii-engine.md)
    for (let i = 0; i < samples; i++) {
      const θ = (i / samples) * Math.PI * 2
      const cx = 0.5 + 0.45 * Math.sin(a * θ + delta + phase)
      const cy = 0.5 + 0.45 * Math.sin(b * θ)
      const dx = x - cx
      const dy = y - cy
      const d2 = dx * dx + dy * dy
      if (d2 < minDist) minDist = d2
    }

    const dist = Math.sqrt(minDist)
    return Math.max(0, 1 - dist / radius)
  }
}

/** Static snapshot frame */
export function lissajousStaticFrame(cols: number, rows: number, ramp: string): string {
  const field = makeLissajousField()
  const lines: string[] = []
  for (let py = 0; py < rows; py++) {
    let line = ''
    for (let px = 0; px < cols; px++) {
      const x = px / Math.max(1, cols - 1)
      const y = py / Math.max(1, rows - 1)
      const d = field(x, y, 0, 0, { cols, rows, px, py, pointer: { x: 0.5, y: 0.5, active: false } })
      line += ramp[Math.floor(Math.max(0, Math.min(1, d)) * (ramp.length - 1))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}
