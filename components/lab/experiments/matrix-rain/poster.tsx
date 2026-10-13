const columns = 96;
const rows = 54;
const glyph = { columns: 6, rows: 8 } as const;
const trail = 9;
const lens = { radius: 15, strength: 0.55, x: 61, y: 25 } as const;

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

const intensityAt = (cellColumn: number, cellRow: number) =>
  Math.max(dropAt(cellColumn, cellRow, 0), dropAt(cellColumn, cellRow, 1));

const markAt = (cellColumn: number, cellRow: number, x: number, y: number) => {
  const bitmap =
    bitmaps[
      Math.floor(hash(cellColumn * 12.9 + cellRow * 78.2) * bitmaps.length)
    ];
  return bitmap?.[y]?.[x] === "#";
};

let inkPath = "";
for (let index = 0; index < columns * rows; index += 1) {
  const x = index % columns;
  const y = Math.floor(index / columns);
  const centerX = x + 0.5;
  const centerY = y + 0.5;
  const awayX = centerX - lens.x;
  const awayY = centerY - lens.y;
  const spread =
    Math.exp(-(awayX * awayX + awayY * awayY) / lens.radius ** 2) *
    lens.strength *
    lens.radius;
  if (Math.abs(awayX) < spread) {
    continue;
  }
  const sourceX = lens.x + Math.sign(awayX) * (Math.abs(awayX) - spread);
  const cellColumn = Math.floor(sourceX / glyph.columns);
  const cellRow = Math.floor(y / glyph.rows);
  const dotX = Math.floor(sourceX - cellColumn * glyph.columns);
  const dotY = y - cellRow * glyph.rows;
  const intensity = intensityAt(cellColumn, cellRow);
  const threshold = ((bayer4[y % 4]?.[x % 4] ?? 0) + 0.5) / 16;
  if (intensity > threshold && markAt(cellColumn, cellRow, dotX, dotY)) {
    inkPath += `M${centerX} ${centerY}h0`;
  }
}

export const MatrixRainPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${columns} ${rows}`}
  >
    <path
      className="stroke-ink"
      d={inkPath}
      fill="none"
      strokeLinecap="round"
      strokeWidth={0.8}
    />
  </svg>
);
