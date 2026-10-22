import { detailPosterGrid } from "@/components/lab/source/write-poster-bitmap";

const { columns, rows } = detailPosterGrid;
const glyph = { columns: 6, rows: 8 } as const;
const trail = 9;

const bitmaps = [
  [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
] as const;

const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

const hash = (seed: number) => {
  const value = Math.sin(seed * 91.3458) * 47_453.5453;
  return value - Math.floor(value);
};

const glyphRows = Math.ceil(rows / glyph.rows);

const dropAt = (cellColumn: number, cellRow: number, layer: number) => {
  const seed = cellColumn * 1.618 + layer * 17.31;
  const span = glyphRows + trail + Math.floor(hash(seed + 3.1) * 4);
  const head = Math.floor(hash(seed + 7.7) * span);
  const behind = head - cellRow;
  if (behind < 0 || behind >= trail) {
    return 0;
  }
  return behind === 0 ? 1 : (1 - behind / trail) ** 1.2 * 0.9;
};

const smoothstep = (low: number, high: number, value: number) => {
  const amount = Math.min(Math.max((value - low) / (high - low), 0), 1);
  return amount * amount * (3 - 2 * amount);
};

const intensityAt = (
  luma: Float32Array,
  cellColumn: number,
  cellRow: number,
  x: number,
  y: number
) => {
  const rain = Math.max(
    dropAt(cellColumn, cellRow, 0),
    dropAt(cellColumn, cellRow, 1)
  );
  const picture = smoothstep(0.2, 0.8, 1 - (luma[y * columns + x] ?? 1));
  return Math.max(rain * (0.2 + 0.8 * picture), picture * 0.8);
};

const markAt = (cellColumn: number, cellRow: number, x: number, y: number) => {
  const bitmap =
    bitmaps[
      Math.floor(hash(cellColumn * 12.9 + cellRow * 78.2) * bitmaps.length)
    ];
  return bitmap?.[y]?.[x] === "#";
};

export const rainPoster = (luma: Float32Array) => {
  const ink = new Uint8Array(columns * rows);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cellColumn = Math.floor(x / glyph.columns);
      const cellRow = Math.floor(y / glyph.rows);
      const dotX = x - cellColumn * glyph.columns;
      const dotY = y - cellRow * glyph.rows;
      const intensity = intensityAt(luma, cellColumn, cellRow, x, y);
      const threshold = ((bayer4[y % 4]?.[x % 4] ?? 0) + 0.5) / 16;
      if (intensity > threshold && markAt(cellColumn, cellRow, dotX, dotY)) {
        ink[y * columns + x] = 1;
      }
    }
  }
  return ink;
};
