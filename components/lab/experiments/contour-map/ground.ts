import type { SourceKind } from "@/components/lab/source/tone-chunk";

import { formHeight } from "./contours";

export const portraitRows = 128;

export interface LumaGrid {
  width: number;
  height: number;
  values: Float32Array;
}

export const lumaGridFromImage = (image: HTMLImageElement): LumaGrid | null => {
  const height = portraitRows;
  const width = Math.max(
    1,
    Math.round((height * image.naturalWidth) / Math.max(image.naturalHeight, 1))
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  const values = new Float32Array(width * height);
  for (let index = 0; index < values.length; index += 1) {
    const red = data[index * 4] ?? 0;
    const green = data[index * 4 + 1] ?? 0;
    const blue = data[index * 4 + 2] ?? 0;
    values[index] = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  }
  return { height, values, width };
};

const lumaAt = (grid: LumaGrid, column: number, row: number) => {
  const x = Math.min(Math.max(column, 0), grid.width - 1);
  const y = Math.min(Math.max(row, 0), grid.height - 1);
  return grid.values[y * grid.width + x] ?? 0;
};

const sampleLuma = (grid: LumaGrid, u: number, v: number) => {
  const x = u * grid.width - 0.5;
  const y = (1 - v) * grid.height - 0.5;
  const column = Math.floor(x);
  const row = Math.floor(y);
  const blendX = x - column;
  const blendY = y - row;
  const top =
    lumaAt(grid, column, row) * (1 - blendX) +
    lumaAt(grid, column + 1, row) * blendX;
  const bottom =
    lumaAt(grid, column, row + 1) * (1 - blendX) +
    lumaAt(grid, column + 1, row + 1) * blendX;
  return top * (1 - blendY) + bottom * blendY;
};

export const groundHeight = (
  source: SourceKind,
  point: { x: number; y: number },
  aspect: number,
  portrait: LumaGrid | null
) => {
  if (source === "portrait" && portrait) {
    const scale = Math.max(aspect, 1);
    return sampleLuma(portrait, point.x / scale + 0.5, point.y / scale + 0.5);
  }
  return formHeight(point.x, point.y);
};
