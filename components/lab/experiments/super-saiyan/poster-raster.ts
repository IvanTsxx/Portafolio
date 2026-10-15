import { crc32, deflateSync } from "node:zlib";

import { orderedDither } from "@/components/lab/experiments/error-diffusion/dither";

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

const chunk = (type: string, data: Uint8Array) => {
  const body = new Uint8Array(4 + data.length);
  body.set(new TextEncoder().encode(type), 0);
  body.set(data, 4);
  const framed = new Uint8Array(12 + data.length);
  const view = new DataView(framed.buffer);
  view.setUint32(0, data.length);
  framed.set(body, 4);
  view.setUint32(8 + data.length, crc32(body));
  return framed;
};

const pngSignature = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const encodeGrayPng = (
  scanlines: Uint8Array,
  width: number,
  height: number,
  bitDepth: 1 | 8
) => {
  const header = new Uint8Array(13);
  const headerView = new DataView(header.buffer);
  headerView.setUint32(0, width);
  headerView.setUint32(4, height);
  header[8] = bitDepth;
  return Buffer.concat([
    pngSignature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", new Uint8Array(0)),
  ]);
};

export const encodeInkPng = (
  ink: Uint8Array,
  width: number,
  height: number
) => {
  const stride = Math.ceil(width / 8) + 1;
  const scanlines = new Uint8Array(stride * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (ink[y * width + x]) {
        const offset = y * stride + 1 + Math.floor(x / 8);
        scanlines[offset] = (scanlines[offset] ?? 0) + 2 ** (7 - (x % 8));
      }
    }
  }
  return encodeGrayPng(scanlines, width, height, 1);
};

export const encodeLevelPng = (levels: Uint8Array, side: number) => {
  const stride = side + 1;
  const scanlines = new Uint8Array(stride * side);
  for (let y = 0; y < side; y += 1) {
    scanlines.set(levels.subarray(y * side, (y + 1) * side), y * stride + 1);
  }
  return encodeGrayPng(scanlines, side, side, 8);
};
