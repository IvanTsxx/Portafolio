// lib/ascii/fields/wave.ts
// Interference wave field — two sinusoidal plane waves at different angles.
// Precalculation: none needed (O(1) per cell already).
import type { FieldFn } from '../types'

export interface WaveParams {
  freq1?: number    // spatial frequency of wave 1; default 4
  freq2?: number    // spatial frequency of wave 2; default 3
  speed?: number    // animation speed multiplier; default 0.4
  angle?: number    // angle between the two waves in radians; default Math.PI/3
}

export function makeWaveField(params: WaveParams = {}): FieldFn {
  const {
    freq1 = 4,
    freq2 = 3,
    speed = 0.4,
    angle = Math.PI / 3,
  } = params

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  return (x, y, t) => {
    const w1 = Math.sin(x * freq1 * Math.PI * 2 - t * speed)
    const w2 = Math.sin((x * cos + y * sin) * freq2 * Math.PI * 2 + t * speed * 0.7)
    return (w1 + w2) * 0.25 + 0.5
  }
}

/** Static snapshot frame — the "lindo" zero-motion frame */
export function waveStaticFrame(cols: number, rows: number, ramp: string): string {
  const lines: string[] = []
  for (let py = 0; py < rows; py++) {
    let line = ''
    for (let px = 0; px < cols; px++) {
      const x = px / Math.max(1, cols - 1)
      const y = py / Math.max(1, rows - 1)
      const w1 = Math.sin(x * 4 * Math.PI * 2)
      const w2 = Math.sin((x * 0.5 + y * 0.866) * 3 * Math.PI * 2)
      const d = (w1 + w2) * 0.25 + 0.5
      line += ramp[Math.floor(Math.max(0, Math.min(1, d)) * (ramp.length - 1))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}
