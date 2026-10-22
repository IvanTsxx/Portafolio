import { posterGrid } from "@/components/lab/source/write-poster-bitmap";

const focus = { reach: 0.2, x: 0.52, y: 0.42 } as const;
const smearColumns = 46;

const smoothstep = (low: number, high: number, value: number) => {
  const amount = Math.min(Math.max((value - low) / (high - low), 0), 1);
  return amount * amount * (3 - 2 * amount);
};

export const inkCurve = (luma: number) => smoothstep(0.04, 0.96, 1 - luma);

const fract = (value: number) => value - Math.floor(value);

const streakLength = (row: number) =>
  0.45 + 1.1 * fract(Math.sin(Math.floor(row / 3) * 12.9898) * 43_758.5453);

export const smearPoster = (luma: Float32Array) => {
  const { columns, rows } = posterGrid;
  const smeared = new Float32Array(luma.length);
  for (let row = 0; row < rows; row += 1) {
    const awayY = (row / rows - focus.y) / focus.reach;
    for (let column = 0; column < columns; column += 1) {
      const awayX = (column - focus.x * columns) / rows / (focus.reach * 1.6);
      const mask = Math.exp(-awayX * awayX - awayY * awayY);
      const reach = Math.round(smearColumns * mask * streakLength(row) * 0.5);
      let total = 0;
      for (let offset = -reach; offset <= reach; offset += 1) {
        const sample = Math.min(Math.max(column + offset, 0), columns - 1);
        total += luma[row * columns + sample] ?? 0;
      }
      smeared[row * columns + column] = total / (reach * 2 + 1);
    }
  }
  return smeared;
};
