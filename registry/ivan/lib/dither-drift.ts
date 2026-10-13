import type { DitherFrame } from "./dither";

export interface DriftPointer {
  x: number;
  y: number;
}

export interface DriftSettings {
  amplitude: number;
  band: number;
  cell: number;
}

export const driftRows = (
  source: DitherFrame,
  target: Uint8ClampedArray,
  pointer: DriftPointer,
  intensity: number,
  time: number,
  { amplitude, band, cell }: DriftSettings
) => {
  const { data, height, width } = source;
  const rowBytes = width * 4;
  const bandHeight = Math.max(1, height * band);
  const lean = ((pointer.x - width / 2) / width) * amplitude;
  for (let y = 0; y < height; y += 1) {
    const row = Math.floor(y / cell);
    const distance = (y - pointer.y) / bandHeight;
    const falloff = Math.exp(-distance * distance);
    const wave =
      Math.sin(time * 0.008 + row * 0.9) +
      0.5 * Math.sin(time * 0.013 - row * 0.37);
    const shift =
      Math.round((intensity * falloff * (amplitude * wave + lean)) / cell) *
      cell;
    const start = y * rowBytes;
    const offset = ((shift % width) + width) % width;
    target.set(
      data.subarray(start + (width - offset) * 4, start + rowBytes),
      start
    );
    target.set(
      data.subarray(start, start + (width - offset) * 4),
      start + offset * 4
    );
  }
};
