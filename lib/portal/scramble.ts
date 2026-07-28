// lib/portal/scramble.ts
// Text scramble for route name during portal transition.
// Uses mulberry32 so each frame is deterministic given (seed, frame).
// Duration budget: runs inside the 900ms portal, starts ~200ms in, ends by ~700ms.
import { mulberry32 } from '@/lib/ascii/utils/mulberry32'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+[]{}|;:,.<>?/\\'

/**
 * Given the target string, elapsed progress [0..1], and a seed,
 * returns the scrambled string for that frame.
 *
 * Progress < 0.3: fully scrambled
 * Progress 0.3..1.0: characters reveal left-to-right
 */
export function scrambleFrame(target: string, progress: number, seed: number): string {
  const rand = mulberry32(seed + Math.floor(progress * 10000))
  const revealedCount = Math.floor(progress > 0.3 ? ((progress - 0.3) / 0.7) * target.length : 0)

  let out = ''
  for (let i = 0; i < target.length; i++) {
    if (target[i] === ' ') {
      out += ' '
    } else if (i < revealedCount) {
      out += target[i]
    } else {
      out += CHARS[Math.floor(rand() * CHARS.length)]
    }
  }
  return out
}
