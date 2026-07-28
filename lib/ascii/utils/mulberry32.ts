// lib/ascii/utils/mulberry32.ts
// Seeded PRNG — deterministic on server and client.
// Never use Math.random() in anything that renders in SSR.

/**
 * Returns a PRNG function seeded with `seed`.
 * Each call returns a float in [0, 1).
 * Algorithm: mulberry32 (fast, good distribution, tiny footprint).
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

/**
 * Convenience: single random float in [min, max) from a seed + index.
 * Good for generating stable initial values per cell.
 */
export function seededFloat(seed: number, index: number): number {
  return mulberry32(seed + index * 2654435761)()
}

/**
 * Convenience: integer in [0, n) from seed + index.
 */
export function seededInt(seed: number, index: number, n: number): number {
  return Math.floor(seededFloat(seed, index) * n)
}
