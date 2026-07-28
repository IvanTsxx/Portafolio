// lib/ascii/utils/dither.ts
// Bayer matrix ordered dithering — used for borders and decorative elements.

/** Bayer 4x4 matrix, values 0–15 (normalised to 0–1 when dividing by 16) */
export const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
] as const

/**
 * Returns 1 if the pixel at (x, y) should be "on" given a normalized
 * brightness [0, 1]. Useful for ASCII dithering where you want a
 * character or a space based on local density.
 */
export function bayerThreshold(x: number, y: number, brightness: number): boolean {
  const threshold = BAYER_4X4[y & 3][x & 3] / 16
  return brightness > threshold
}

/**
 * For a given cell (col, row) in an ASCII grid, return the dither character
 * for a border. Even cells on the matrix get the char, odd get a space.
 * Creates a halftone / dithered texture effect on borders.
 */
export function ditherChar(col: number, row: number, char = '·'): string {
  return bayerThreshold(col, row, 0.5) ? char : ' '
}

/**
 * Generate a full dither line of `cols` columns.
 * @param char the character to use for "on" pixels
 */
export function ditherLine(row: number, cols: number, char = '·'): string {
  let out = ''
  for (let c = 0; c < cols; c++) {
    out += ditherChar(c, row, char)
  }
  return out
}
