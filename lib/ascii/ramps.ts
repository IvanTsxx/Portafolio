// lib/ascii/ramps.ts
// Named character ramps — sparse (index 0) to dense (last index).
// Each character corresponds to a density band [0..1].
// Usage: ramp[Math.floor(density * (ramp.length - 1))]

/** Classic: the original Paull ramp for photographic ASCII */
export const RAMP_CLASSIC = ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

/** Blocks: unicode block elements for smoother density gradients */
export const RAMP_BLOCKS = ' ░▒▓█'

/** Dots: punctuation-heavy, evokes dithering and halftone */
export const RAMP_DOTS = ' ·.,;:·'

/** Tech: monospace-friendly, reads as terminal / code output */
export const RAMP_TECH = ' .:!|)([]{}=+#@'

/** Organic: curved and flowing characters, for natural fields */
export const RAMP_ORGANIC = ' ~-+=*#@'

/**
 * Map a density [0, 1] to a character in a ramp string.
 * Clamps out-of-range values.
 */
export function densityToChar(density: number, ramp: string): string {
  const idx = Math.floor(Math.max(0, Math.min(1, density)) * (ramp.length - 1))
  return ramp[idx]
}

/**
 * Map a density [0, 1] to an index in a ramp.
 */
export function densityToIndex(density: number, ramp: string): number {
  return Math.floor(Math.max(0, Math.min(1, density)) * (ramp.length - 1))
}
