export const monogramViewBox = "0 0 64 64";

export const monogramGlyphPath =
  "M17 8.5h30v3.2c-3.6.2-5.2 1.1-5.2 4.3v32c0 3.2 1.6 4.1 5.2 4.3v3.2H17v-3.2c3.6-.2 5.2-1.1 5.2-4.3V16c0-3.2-1.6-4.1-5.2-4.3Z";

export const monogramIncision = {
  x1: 14,
  x2: 50,
  y1: 48,
  y2: 16,
} as const;

export const monogramIncisionWidth = {
  mark: 2.4,
  small: 5,
} as const;

export type MonogramWeight = keyof typeof monogramIncisionWidth;

export const monogramTightViewBox = "6 6 52 52";
