import { posterGrid } from "@/components/lab/source/write-poster-bitmap";

const contrast = 1.4;

export const stipplePoster = (
  luma: Float32Array,
  thresholds: Uint8Array,
  side: number
) => {
  const { columns, rows } = posterGrid;
  const ink = new Uint8Array(columns * rows);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const index = y * columns + x;
      const light = Math.min(
        Math.max(((luma[index] ?? 0) - 0.5) * contrast + 0.5, 0),
        1
      );
      const threshold = (thresholds[(y % side) * side + (x % side)] ?? 0) / 255;
      ink[index] = threshold < light ? 0 : 1;
    }
  }
  return ink;
};
