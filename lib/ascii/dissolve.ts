// Minimal matrix dissolve — glitch then drop cells to space. No color invert.
import { seededFloat, seededInt } from './utils/mulberry32'

const GLITCH = '.:·+=*#%@'

/**
 * progress 0 = full source, 1 = all spaces (photo shows through).
 * Each non-space cell glitches briefly, then drops out in random order.
 */
export function dissolveAscii(
  source: string,
  progress: number,
  seed = 1,
): string {
  if (progress <= 0.001) return source
  if (progress >= 0.999) return source.replace(/[^\n]/g, ' ')

  const tick = Math.floor(progress * 28)
  let out = ''

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!
    if (ch === '\n' || ch === ' ') {
      out += ch
      continue
    }

    const die = seededFloat(seed, i)
    const glitchAt = die * 0.7

    if (progress < glitchAt) {
      out += ch
    } else if (progress < die) {
      out += GLITCH[seededInt(seed + tick, i, GLITCH.length)]!
    } else {
      out += ' '
    }
  }

  return out
}
