import {
  posterToneGrid,
  posterTones,
} from "@/components/lab/source/poster-tones";

type PosterImage = keyof typeof posterTones;

const decoded = new Map<PosterImage, Uint8Array>();

const levelsOf = (image: PosterImage) => {
  const cached = decoded.get(image);
  if (cached) {
    return cached;
  }
  const levels = Uint8Array.from(
    atob(posterTones[image]),
    (character) => character.codePointAt(0) ?? 0
  );
  decoded.set(image, levels);
  return levels;
};

const clamp = (value: number, high: number) =>
  Math.min(Math.max(value, 0), high);

export const posterInkAt = (image: PosterImage, x: number, y: number) => {
  const { columns, rows } = posterToneGrid;
  const levels = levelsOf(image);
  const column = clamp(x * columns - 0.5, columns - 1);
  const row = clamp(y * rows - 0.5, rows - 1);
  const left = Math.floor(column);
  const top = Math.floor(row);
  const right = Math.min(left + 1, columns - 1);
  const bottom = Math.min(top + 1, rows - 1);
  const across = column - left;
  const down = row - top;
  const at = (sampleColumn: number, sampleRow: number) =>
    (levels[sampleRow * columns + sampleColumn] ?? 0) / 255;
  const upper = at(left, top) * (1 - across) + at(right, top) * across;
  const lower = at(left, bottom) * (1 - across) + at(right, bottom) * across;
  return 1 - (upper * (1 - down) + lower * down);
};
