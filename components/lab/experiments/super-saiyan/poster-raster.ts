import { orderedDither } from "@/components/lab/source/ordered-dither";

import { curveTone } from "./tone";

export const posterGrid = { columns: 180, rows: 120 } as const;

const lumaOf = (red: number, green: number, blue: number) =>
  (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

const boxBlur = (
  values: Float32Array,
  width: number,
  height: number,
  radius: number
) => {
  const blurred = new Float32Array(values.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let total = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sampleX = Math.min(Math.max(x + dx, 0), width - 1);
          const sampleY = Math.min(Math.max(y + dy, 0), height - 1);
          total += values[sampleY * width + sampleX] ?? 0;
          count += 1;
        }
      }
      blurred[y * width + x] = total / count;
    }
  }
  return blurred;
};

export const ditherPoster = (
  rgb: Uint8Array,
  width: number,
  height: number
) => {
  const luma = new Float32Array(width * height);
  for (let index = 0; index < luma.length; index += 1) {
    luma[index] = lumaOf(
      rgb[index * 3] ?? 0,
      rgb[index * 3 + 1] ?? 0,
      rgb[index * 3 + 2] ?? 0
    );
  }
  const blurred = boxBlur(luma, width, height, 2);
  const values = luma.map(
    (value, index) => curveTone(value, blurred[index] ?? value) * 255
  );
  return orderedDither({ height, values, width });
};
