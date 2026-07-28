// lib/ascii/fields/flow.ts
// Curl-noise flow field using pre-initialised Perlin noise.
// Buffer strategy: density buffer is recomputed only on resize (passed in);
// the per-frame pass modulates by pointer and time.
import type { FieldFn } from '../types'
import { noise3 } from '../utils/perlin'

export interface FlowParams {
  scale?:  number   // noise zoom; default 2.5
  speed?:  number   // time multiplier; default 0.25
  curl?:   number   // how much flow curves; default 0.35
}

export function makeFlowField(params: FlowParams = {}): FieldFn {
  const {
    scale = 2.5,
    speed = 0.25,
    curl  = 0.35,
  } = params

  return (x, y, t) => {
    const nx = x * scale
    const ny = y * scale
    const nt = t * speed

    // Two octaves of noise for density
    const n1 = noise3(nx, ny, nt)
    const n2 = noise3(nx * 2.1, ny * 2.1, nt * 1.8) * 0.5

    // Curl deviation — shift x by a small perpendicular noise
    const nc = noise3(nx + 100, ny + 100, nt) - 0.5

    return (n1 + n2 * 0.5 + nc * curl) / (1 + 0.5 + 0.5 * curl)
  }
}

/** Static snapshot frame */
export function flowStaticFrame(cols: number, rows: number, ramp: string): string {
  const lines: string[] = []
  const scale = 2.5
  for (let py = 0; py < rows; py++) {
    let line = ''
    for (let px = 0; px < cols; px++) {
      const x = px / Math.max(1, cols - 1)
      const y = py / Math.max(1, rows - 1)
      const d = noise3(x * scale, y * scale, 0)
      line += ramp[Math.floor(Math.max(0, Math.min(1, d)) * (ramp.length - 1))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}
