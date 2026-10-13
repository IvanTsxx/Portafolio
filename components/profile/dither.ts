export interface DitherFrame {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type Rgb = readonly [number, number, number];

export interface DitherPalette {
  dark: Rgb;
  light: Rgb;
}

export const tokenRgb = (
  context: CanvasRenderingContext2D,
  token: string
): Rgb => {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
};

const PIXEL_SCALE = 2;
const TONE_CONTRAST = 18;
const TONE_BRIGHTNESS = 8;
const DITHER_CONTRAST = 14;
const BAYER_SIDE = 4;

const clamp = (value: number) => Math.min(255, Math.max(0, value));

const contrastFactor = (contrast: number) => {
  const scaled = contrast * 2.55;
  return (259 * (scaled + 255)) / (255 * (259 - scaled));
};

const bayerMatrix = (() => {
  let current = [0];
  let side = 1;
  while (side < BAYER_SIDE) {
    const doubled = side * 2;
    const next: number[] = Array.from({ length: doubled * doubled }, () => 0);
    for (let y = 0; y < side; y += 1) {
      for (let x = 0; x < side; x += 1) {
        const value = (current[y * side + x] ?? 0) * 4;
        next[y * doubled + x] = value;
        next[y * doubled + x + side] = value + 2;
        next[(y + side) * doubled + x] = value + 3;
        next[(y + side) * doubled + x + side] = value + 1;
      }
    }
    current = next;
    side = doubled;
  }
  return current.map((value) => (value + 0.5) / current.length);
})();

const luminanceAt = (data: Uint8ClampedArray, index: number) =>
  0.2126 * (data[index] ?? 0) +
  0.7152 * (data[index + 1] ?? 0) +
  0.0722 * (data[index + 2] ?? 0);

const blockTone = (
  frame: DitherFrame,
  blockX: number,
  blockY: number,
  toneFactor: number,
  ditherFactor: number
) => {
  const x0 = blockX * PIXEL_SCALE;
  const y0 = blockY * PIXEL_SCALE;
  const x1 = Math.min(x0 + PIXEL_SCALE, frame.width);
  const y1 = Math.min(y0 + PIXEL_SCALE, frame.height);
  let sum = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const level = luminanceAt(frame.data, (y * frame.width + x) * 4);
      sum += clamp(toneFactor * (level - 128) + 128 + TONE_BRIGHTNESS);
    }
  }
  const average = sum / ((x1 - x0) * (y1 - y0));
  return clamp((average - 128) * ditherFactor + 128);
};

export const ditherFrame = (
  frame: DitherFrame,
  palette: DitherPalette
): DitherFrame => {
  const toneFactor = contrastFactor(TONE_CONTRAST);
  const ditherFactor = contrastFactor(DITHER_CONTRAST);
  const blocksWide = Math.ceil(frame.width / PIXEL_SCALE);
  const blocksHigh = Math.ceil(frame.height / PIXEL_SCALE);
  const lightBlocks = new Uint8Array(blocksWide * blocksHigh);
  for (let by = 0; by < blocksHigh; by += 1) {
    for (let bx = 0; bx < blocksWide; bx += 1) {
      const threshold =
        bayerMatrix[(by % BAYER_SIDE) * BAYER_SIDE + (bx % BAYER_SIDE)] ?? 0.5;
      const tone = blockTone(frame, bx, by, toneFactor, ditherFactor) / 255;
      lightBlocks[by * blocksWide + bx] = tone > threshold ? 1 : 0;
    }
  }
  const data = new Uint8ClampedArray(frame.width * frame.height * 4);
  for (let y = 0; y < frame.height; y += 1) {
    const row = Math.floor(y / PIXEL_SCALE) * blocksWide;
    for (let x = 0; x < frame.width; x += 1) {
      const color = lightBlocks[row + Math.floor(x / PIXEL_SCALE)]
        ? palette.light
        : palette.dark;
      const offset = (y * frame.width + x) * 4;
      data.set([...color, 255], offset);
    }
  }
  return { data, height: frame.height, width: frame.width };
};
