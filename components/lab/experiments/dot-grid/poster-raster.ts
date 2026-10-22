import { detailPosterGrid } from "@/components/lab/source/write-poster-bitmap";

const cell = 9;
const lens = { radius: 44, strength: 1, x: 0.62, y: 0.4 } as const;

const smoothstep = (low: number, high: number, value: number) => {
  const amount = Math.min(Math.max((value - low) / (high - low), 0), 1);
  return amount * amount * (3 - 2 * amount);
};

const cellTone = (
  luma: Float32Array,
  columns: number,
  rows: number,
  centerX: number,
  centerY: number
) => {
  let total = 0;
  let count = 0;
  const half = Math.floor(cell / 2);
  for (let dy = -half; dy <= half; dy += 1) {
    for (let dx = -half; dx <= half; dx += 1) {
      const sampleX = Math.min(
        Math.max(Math.floor(centerX) + dx, 0),
        columns - 1
      );
      const sampleY = Math.min(Math.max(Math.floor(centerY) + dy, 0), rows - 1);
      total += luma[sampleY * columns + sampleX] ?? 1;
      count += 1;
    }
  }
  return smoothstep(0.05, 0.95, 1 - total / count);
};

export const dotPoster = (luma: Float32Array) => {
  const { columns, rows } = detailPosterGrid;
  const ink = new Uint8Array(columns * rows);
  const lensX = lens.x * columns;
  const lensY = lens.y * rows;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cellX = Math.floor(x / cell);
      const cellY = Math.floor(y / cell);
      for (let dy = -1; dy <= 1 && !ink[y * columns + x]; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const centerX = (cellX + dx + 0.5) * cell;
          const centerY = (cellY + dy + 0.5) * cell;
          const tone = cellTone(luma, columns, rows, centerX, centerY);
          const awayX = centerX - lensX;
          const awayY = centerY - lensY;
          const distance = Math.hypot(awayX, awayY);
          const falloff =
            Math.exp(-((distance / lens.radius) ** 2)) * lens.strength;
          const push = distance > 0 ? (falloff * cell * 0.6) / distance : 0;
          const radius =
            cell * 0.5 * Math.min(0.12 + tone * 0.78 + falloff * 0.55, 1.35);
          const offsetX = x + 0.5 - (centerX + awayX * push);
          const offsetY = y + 0.5 - (centerY + awayY * push);
          if (Math.hypot(offsetX, offsetY) < radius) {
            ink[y * columns + x] = 1;
            break;
          }
        }
      }
    }
  }
  return ink;
};
