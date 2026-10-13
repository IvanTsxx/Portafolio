export type Rgb = readonly [number, number, number];

export interface DitherFrame {
  data: Uint8ClampedArray;
  height: number;
  width: number;
}

export interface DitherPalette {
  dark: Rgb;
  light: Rgb;
}

export interface DitherOptions {
  contrast: number;
  pixelSize: number;
}

export const BAYER_SIDE = 4;

const TONE_CONTRAST = 18;
const TONE_BRIGHTNESS = 8;

const clampByte = (value: number) => Math.min(255, Math.max(0, value));

const contrastFactor = (contrast: number) => {
  const scaled = contrast * 2.55;
  return (259 * (scaled + 255)) / (255 * (259 - scaled));
};

const buildBayerThresholds = () => {
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
};

export const bayerThresholds: readonly number[] = buildBayerThresholds();

export const bayerThreshold = (x: number, y: number) =>
  bayerThresholds[(y % BAYER_SIDE) * BAYER_SIDE + (x % BAYER_SIDE)] ?? 0.5;

export const luminance = ([red, green, blue]: Rgb) =>
  0.2126 * red + 0.7152 * green + 0.0722 * blue;

export const orderPalette = (first: Rgb, second: Rgb): DitherPalette =>
  luminance(first) <= luminance(second)
    ? { dark: first, light: second }
    : { dark: second, light: first };

export const resolveColor = (element: Element, color: string): Rgb => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return [0, 0, 0];
  }
  context.fillStyle = color.startsWith("--")
    ? getComputedStyle(element).getPropertyValue(color).trim()
    : color;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
};

const pixelLuminance = (data: Uint8ClampedArray, index: number) =>
  luminance([data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0]);

const blockTone = (
  frame: DitherFrame,
  blockX: number,
  blockY: number,
  pixelSize: number,
  toneFactor: number,
  ditherFactor: number
) => {
  const x0 = blockX * pixelSize;
  const y0 = blockY * pixelSize;
  const x1 = Math.min(x0 + pixelSize, frame.width);
  const y1 = Math.min(y0 + pixelSize, frame.height);
  let sum = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const level = pixelLuminance(frame.data, (y * frame.width + x) * 4);
      sum += clampByte(toneFactor * (level - 128) + 128 + TONE_BRIGHTNESS);
    }
  }
  const average = sum / ((x1 - x0) * (y1 - y0));
  return clampByte((average - 128) * ditherFactor + 128);
};

export const ditherFrame = (
  frame: DitherFrame,
  palette: DitherPalette,
  { contrast, pixelSize }: DitherOptions
): DitherFrame => {
  const toneFactor = contrastFactor(TONE_CONTRAST);
  const ditherFactor = contrastFactor(contrast);
  const blocksWide = Math.ceil(frame.width / pixelSize);
  const blocksHigh = Math.ceil(frame.height / pixelSize);
  const lightBlocks = new Uint8Array(blocksWide * blocksHigh);
  for (let blockY = 0; blockY < blocksHigh; blockY += 1) {
    for (let blockX = 0; blockX < blocksWide; blockX += 1) {
      const tone =
        blockTone(frame, blockX, blockY, pixelSize, toneFactor, ditherFactor) /
        255;
      lightBlocks[blockY * blocksWide + blockX] =
        tone > bayerThreshold(blockX, blockY) ? 1 : 0;
    }
  }
  const data = new Uint8ClampedArray(frame.width * frame.height * 4);
  for (let y = 0; y < frame.height; y += 1) {
    const row = Math.floor(y / pixelSize) * blocksWide;
    for (let x = 0; x < frame.width; x += 1) {
      const color = lightBlocks[row + Math.floor(x / pixelSize)]
        ? palette.light
        : palette.dark;
      data.set([...color, 255], (y * frame.width + x) * 4);
    }
  }
  return { data, height: frame.height, width: frame.width };
};
