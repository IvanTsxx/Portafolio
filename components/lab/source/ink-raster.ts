import { formInkAt } from "@/components/lab/source/form-tone";
import type { LightPoint } from "@/components/lab/source/form-tone";
import type { SourceKind } from "@/components/lab/source/tone-chunk";

export interface InkRaster {
  width: number;
  height: number;
  ink: Float32Array;
}

export interface StagePoint {
  x: number;
  y: number;
}

export const lightFromStage = (stage: StagePoint, aspect: number) => ({
  x: (stage.x - 0.5) * aspect,
  y: stage.y - 0.5,
});

const pointX = (column: number, width: number, height: number) =>
  (column + 0.5 - width / 2) / height;

const pointY = (row: number, height: number) =>
  (height / 2 - row - 0.5) / height;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export const formRaster = (
  width: number,
  height: number,
  light: LightPoint
): InkRaster => {
  const ink = new Float32Array(width * height);
  for (let row = 0; row < height; row += 1) {
    const y = pointY(row, height);
    for (let column = 0; column < width; column += 1) {
      ink[row * width + column] = formInkAt(
        pointX(column, width, height),
        y,
        light
      );
    }
  }
  return { height, ink, width };
};

export const readPortraitLuma = (
  image: HTMLImageElement,
  width: number,
  height: number
) => {
  const luma = new Float32Array(width * height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return luma;
  }
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
  const { data } = context.getImageData(0, 0, width, height);
  for (let index = 0; index < luma.length; index += 1) {
    const offset = index * 4;
    luma[index] =
      (0.2126 * (data[offset] ?? 0) +
        0.7152 * (data[offset + 1] ?? 0) +
        0.0722 * (data[offset + 2] ?? 0)) /
      255;
  }
  return luma;
};

export const relightPortrait = (
  luma: Float32Array,
  width: number,
  height: number,
  light: LightPoint
): InkRaster => {
  const ink = new Float32Array(width * height);
  for (let row = 0; row < height; row += 1) {
    const y = pointY(row, height);
    const above = Math.max(row - 1, 0) * width;
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      const here = luma[index] ?? 0;
      const right = luma[row * width + Math.min(column + 1, width - 1)] ?? 0;
      const up = luma[above + column] ?? 0;
      const normalX = -(right - here) * 4;
      const normalY = -(up - here) * 4;
      const normalLength = Math.hypot(normalX, normalY, 1);
      const x = pointX(column, width, height);
      const towardX = light.x - x;
      const towardY = light.y - y;
      const towardLength = Math.hypot(towardX, towardY, 0.6);
      const facing =
        (normalX * towardX + normalY * towardY + 0.6) /
        (normalLength * towardLength);
      const relight = 0.4 + 0.8 * Math.max(facing, 0);
      const reachSquared = towardX * towardX + towardY * towardY;
      const beam = 0.6 + 0.8 * Math.exp(-reachSquared * 5);
      ink[index] = clamp01(1 - here * relight * beam);
    }
  }
  return { height, ink, width };
};

export const inkRaster = (
  source: SourceKind,
  portraitLuma: Float32Array | null,
  width: number,
  height: number,
  light: LightPoint
) =>
  source === "portrait" && portraitLuma
    ? relightPortrait(portraitLuma, width, height, light)
    : formRaster(width, height, light);

export const sampleInk = (
  { width, height, ink }: InkRaster,
  x: number,
  y: number
) => {
  const column = Math.min(Math.max(x - 0.5, 0), width - 1);
  const row = Math.min(Math.max(y - 0.5, 0), height - 1);
  const left = Math.floor(column);
  const top = Math.floor(row);
  const right = Math.min(left + 1, width - 1);
  const bottom = Math.min(top + 1, height - 1);
  const across = column - left;
  const down = row - top;
  const upper =
    (ink[top * width + left] ?? 0) * (1 - across) +
    (ink[top * width + right] ?? 0) * across;
  const lower =
    (ink[bottom * width + left] ?? 0) * (1 - across) +
    (ink[bottom * width + right] ?? 0) * across;
  return upper * (1 - down) + lower * down;
};
