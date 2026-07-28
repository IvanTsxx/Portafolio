// lib/ascii/fields/moire.ts
// Moiré pattern — two concentric ring systems slightly offset in time.
// Pure math, O(1) per cell.
import type { FieldFn } from '../types'

export interface MoireParams {
  freq1?: number   // ring frequency of system 1; default 18
  freq2?: number   // ring frequency of system 2; default 19
  speed?: number   // rotation speed; default 0.15
}

export function makeMoireField(params: MoireParams = {}): FieldFn {
  const { freq1 = 18, freq2 = 19, speed = 0.15 } = params

  return (x, y, t) => {
    const cx = x - 0.5
    const cy = y - 0.5
    const r  = Math.sqrt(cx * cx + cy * cy)

    const ring1 = Math.sin(r * freq1 * Math.PI * 2 - t * speed)
    const ring2 = Math.sin(r * freq2 * Math.PI * 2 + t * speed * 0.8)

    return (ring1 * ring2) * 0.5 + 0.5
  }
}

/** Static snapshot frame */
export function moireStaticFrame(cols: number, rows: number, ramp: string): string {
  const lines: string[] = []
  for (let py = 0; py < rows; py++) {
    let line = ''
    for (let px = 0; px < cols; px++) {
      const x = px / Math.max(1, cols - 1)
      const y = py / Math.max(1, rows - 1)
      const cx = x - 0.5; const cy = y - 0.5
      const r = Math.sqrt(cx * cx + cy * cy)
      const d = (Math.sin(r * 18 * Math.PI * 2) * Math.sin(r * 19 * Math.PI * 2)) * 0.5 + 0.5
      line += ramp[Math.floor(Math.max(0, Math.min(1, d)) * (ramp.length - 1))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}
