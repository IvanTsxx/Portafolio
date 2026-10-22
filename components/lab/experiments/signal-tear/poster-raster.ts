import { posterGrid } from "@/components/lab/source/write-poster-bitmap";
import { seededRandom } from "@/components/profile/repositories/seeded-random";

const smoothstep = (low: number, high: number, value: number) => {
  const amount = Math.min(Math.max((value - low) / (high - low), 0), 1);
  return amount * amount * (3 - 2 * amount);
};

const ghostReach = 22;
const tornShare = 0.35;

export const tearPoster = (luma: Float32Array, seed = 7) => {
  const { columns, rows } = posterGrid;
  const random = seededRandom(seed);
  const shifts = new Int16Array(rows);
  let row = 0;
  while (row < rows) {
    const height = 2 + Math.floor(random() * 12);
    const isTorn = random() < tornShare;
    const shift = isTorn ? Math.round((random() - 0.5) * 60) : 0;
    shifts.fill(shift, row, Math.min(row + height, rows));
    row += height;
  }
  const ink = new Uint8Array(columns * rows);
  for (let y = 0; y < rows; y += 1) {
    const shift = shifts[y] ?? 0;
    for (let x = 0; x < columns; x += 1) {
      const sampleAt = (offset: number) => {
        const column = Math.min(Math.max(x - shift - offset, 0), columns - 1);
        return luma[y * columns + column] ?? 0;
      };
      let light = sampleAt(0);
      for (let offset = 1; offset <= ghostReach; offset += 1) {
        light = Math.max(
          light,
          sampleAt(offset) * (1 - (offset / ghostReach) * 0.85)
        );
      }
      const tone = smoothstep(0.03, 0.85, 0.3 * sampleAt(0) + 0.7 * light);
      const grain = (random() + random() - 1) * 0.12;
      ink[y * columns + x] = tone + grain < random() ? 1 : 0;
    }
  }
  return ink;
};
