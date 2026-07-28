// lib/ascii/fields/barnsley.ts
// Barnsley Fern — iterated function system.
// Strategy: precompute a density buffer once; per-frame only modulate by time.
// Buffer recomputed on grid resize.
import type { FieldFn } from '../types'

export interface BarnsleyParams {
  iterations?: number   // IFS iterations; default 50000
  speed?:      number   // slow drift speed; default 0.05
}

/**
 * Builds a density buffer for the Barnsley fern.
 * Returns a Float32Array of cols*rows normalized densities.
 */
export function buildBarnsleyBuffer(
  cols: number,
  rows: number,
  iterations = 50_000
): Float32Array {
  const buf = new Float32Array(cols * rows)

  let x = 0, y = 0
  for (let i = 0; i < iterations; i++) {
    const r = Math.random()
    let nx: number, ny: number

    if (r < 0.01) {
      nx = 0
      ny = 0.16 * y
    } else if (r < 0.86) {
      nx =  0.85 * x + 0.04 * y
      ny = -0.04 * x + 0.85 * y + 1.6
    } else if (r < 0.93) {
      nx =  0.20 * x - 0.26 * y
      ny =  0.23 * x + 0.22 * y + 1.6
    } else {
      nx = -0.15 * x + 0.28 * y
      ny =  0.26 * x + 0.24 * y + 0.44
    }

    x = nx; y = ny

    if (i > 50) {  // skip transient
      // Fern occupies x: [-2.182, 2.6558], y: [0, 9.9983]
      const px = Math.floor(((x + 2.182) / 4.8378) * (cols - 1))
      const py = Math.floor((1 - y / 9.9983) * (rows - 1))
      if (px >= 0 && px < cols && py >= 0 && py < rows) {
        buf[py * cols + px] += 1
      }
    }
  }

  // Normalize to [0, 1]
  let max = 0
  for (let i = 0; i < buf.length; i++) if (buf[i] > max) max = buf[i]
  if (max > 0) for (let i = 0; i < buf.length; i++) buf[i] /= max

  return buf
}

/**
 * Create a FieldFn that reads from a pre-built buffer.
 * The buffer must be rebuilt on resize (call buildBarnsleyBuffer again).
 */
export function makeBarnsleyField(
  bufferRef: { current: Float32Array | null },
  params: BarnsleyParams = {}
): FieldFn {
  const { speed = 0.05 } = params

  return (x, y, t, _dt, { cols, rows, px, py }) => {
    const buf = bufferRef.current
    if (!buf || buf.length !== cols * rows) return 0
    // Slow drift: shift the read position slightly over time
    const driftX = Math.round(Math.sin(t * speed) * 2)
    const driftY = Math.round(Math.cos(t * speed * 0.7) * 1)
    const sx = Math.max(0, Math.min(cols - 1, px + driftX))
    const sy = Math.max(0, Math.min(rows - 1, py + driftY))
    return buf[sy * cols + sx]
  }
}

/** Static snapshot — calls buildBarnsleyBuffer once with Math.random */
export function barnsleyStaticFrame(cols: number, rows: number, ramp: string): string {
  const buf = buildBarnsleyBuffer(cols, rows, 50_000)
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
