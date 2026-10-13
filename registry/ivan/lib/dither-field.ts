import { bayerThreshold } from "./dither";
import type { Rgb } from "./dither";

export type DitherFieldAnchor =
  | "fill"
  | "top"
  | "bottom"
  | "top-right"
  | "center";

export interface DitherFieldGrid {
  bloom: Float32Array;
  columns: number;
  envelope: Float32Array;
  relief: Float32Array;
  rows: number;
  thresholds: Float32Array;
}

export interface Spring {
  value: number;
  velocity: number;
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
}

export interface DitherFieldLens {
  strength: Spring;
  x: Spring;
  y: Spring;
}

export interface DitherFieldFrame {
  lens: DitherFieldLens;
  ramp: number;
  time: number;
}

export const AMBIENT_FRAME_MS = 1000 / 30;
export const RAMP_SECONDS = 2.4;
export const lensTravel: SpringConfig = { damping: 22, stiffness: 170 };
export const lensSwell: SpringConfig = { damping: 14, stiffness: 120 };

const BLOOM_LATTICE = 32;
const BLOOM_FLOOR = 0.4;
const BLOOM_SPAN = 1;
const LENS_RADIUS = 16;
const LENS_REACH = LENS_RADIUS * 2.6;
const LENS_PULL = 0.42;
const LENS_SMEAR = 0.08;
const LENS_SWELL = 0.18;
const LENS_RIPPLE = 0.16;
const RIPPLE_WAVELENGTH = 0.55;
const RIPPLE_SPEED = 3.2;
const SMEAR_LIMIT = 60;
const SETTLED = 0.002;
const GRAIN_SCALE = 14;
const OPAQUE = 0xff_00_00_00;

const bloomLayers = [
  { scale: 1 / 34, weight: 0.6, x: 0.045, y: 0.018 },
  { scale: 1 / 21, weight: 0.4, x: -0.03, y: 0.035 },
] as const;

const smooth = (value: number) => value * value * (3 - 2 * value);

const fade = (edge0: number, edge1: number, value: number) =>
  smooth(Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0))));

export const seedOf = (text: string) =>
  [...text].reduce(
    (total, character, index) =>
      (total * 31 + (character.codePointAt(0) ?? 0) * (index + 7)) % 9973,
    17
  );

const lattice = (x: number, y: number, seed: number) => {
  const wave = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43_758.5453;
  return wave - Math.floor(wave);
};

const valueNoise = (x: number, y: number, seed: number) => {
  const baseX = Math.floor(x);
  const baseY = Math.floor(y);
  const blendX = smooth(x - baseX);
  const blendY = smooth(y - baseY);
  const top =
    lattice(baseX, baseY, seed) +
    (lattice(baseX + 1, baseY, seed) - lattice(baseX, baseY, seed)) * blendX;
  const bottom =
    lattice(baseX, baseY + 1, seed) +
    (lattice(baseX + 1, baseY + 1, seed) - lattice(baseX, baseY + 1, seed)) *
      blendX;
  return top + (bottom - top) * blendY;
};

const fbm = (x: number, y: number, seed: number) =>
  0.55 * valueNoise(x, y, seed) +
  0.3 * valueNoise(x * 2.1 + 17, y * 2.1 + 9, seed) +
  0.15 * valueNoise(x * 4.3 + 5, y * 4.3 + 31, seed);

const anchorEnvelopes: Record<
  DitherFieldAnchor,
  (across: number, down: number) => number
> = {
  bottom: (_across, down) => fade(0.2, 0.95, down),
  center: (across, down) =>
    1 - fade(0.2, 0.72, Math.hypot(across - 0.5, (down - 0.5) * 0.8) * 1.4),
  fill: () => 1,
  top: (_across, down) => 1 - fade(0.05, 0.8, down),
  "top-right": (across, down) =>
    fade(0.28, 0.92, across) * (1 - fade(0.05, 0.8, down)),
};

export const createDitherFieldGrid = ({
  anchor,
  columns,
  density,
  rows,
  seed,
}: {
  anchor: DitherFieldAnchor;
  columns: number;
  density: number;
  rows: number;
  seed: number;
}): DitherFieldGrid => {
  const cells = columns * rows;
  const envelope = new Float32Array(cells);
  const relief = new Float32Array(cells);
  const thresholds = new Float32Array(cells);
  const envelopeAt = anchorEnvelopes[anchor];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const grain = fbm(column / GRAIN_SCALE, row / GRAIN_SCALE, seed);
      envelope[index] =
        envelopeAt(
          column / Math.max(1, columns - 1),
          row / Math.max(1, rows - 1)
        ) * density;
      relief[index] = Math.min(1, Math.max(0, (grain - 0.42) * 2.4 + 0.4));
      thresholds[index] = bayerThreshold(column, row);
    }
  }
  const bloom = new Float32Array(BLOOM_LATTICE * BLOOM_LATTICE);
  for (const index of bloom.keys()) {
    const wave = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43_758.5453;
    bloom[index] = wave - Math.floor(wave);
  }
  return { bloom, columns, envelope, relief, rows, thresholds };
};

export const createLens = (): DitherFieldLens => ({
  strength: { value: 0, velocity: 0 },
  x: { value: 0, velocity: 0 },
  y: { value: 0, velocity: 0 },
});

export const stepSpring = (
  spring: Spring,
  target: number,
  { damping, stiffness }: SpringConfig,
  seconds: number
) => {
  const acceleration =
    stiffness * (target - spring.value) - damping * spring.velocity;
  spring.velocity += acceleration * seconds;
  spring.value += spring.velocity * seconds;
};

export const isLensSettled = ({ strength }: DitherFieldLens) =>
  Math.abs(strength.value) < SETTLED && Math.abs(strength.velocity) < SETTLED;

export const rampAt = (seconds: number) =>
  smooth(Math.min(1, Math.max(0, seconds / RAMP_SECONDS)));

const wrapLattice = (value: number) =>
  ((value % BLOOM_LATTICE) + BLOOM_LATTICE) % BLOOM_LATTICE;

const latticeAt = (bloom: Float32Array, x: number, y: number) =>
  bloom[wrapLattice(y) * BLOOM_LATTICE + wrapLattice(x)] ?? 0;

const bloomNoise = (bloom: Float32Array, x: number, y: number) => {
  const baseX = Math.floor(x);
  const baseY = Math.floor(y);
  const blendX = smooth(x - baseX);
  const blendY = smooth(y - baseY);
  const top =
    latticeAt(bloom, baseX, baseY) +
    (latticeAt(bloom, baseX + 1, baseY) - latticeAt(bloom, baseX, baseY)) *
      blendX;
  const bottom =
    latticeAt(bloom, baseX, baseY + 1) +
    (latticeAt(bloom, baseX + 1, baseY + 1) -
      latticeAt(bloom, baseX, baseY + 1)) *
      blendX;
  return top + (bottom - top) * blendY;
};

const bloomGain = (
  bloom: Float32Array,
  column: number,
  row: number,
  time: number
) => {
  let total = 0;
  for (const layer of bloomLayers) {
    total +=
      layer.weight *
      bloomNoise(
        bloom,
        column * layer.scale + time * layer.x,
        row * layer.scale + time * layer.y
      );
  }
  const contrast = Math.min(1, Math.max(0, (total - 0.5) * 1.8 + 0.5));
  return BLOOM_FLOOR + BLOOM_SPAN * smooth(contrast);
};

const sampleAt = (
  field: Float32Array,
  columns: number,
  rows: number,
  x: number,
  y: number
) => {
  const column = Math.min(columns - 1, Math.max(0, x));
  const row = Math.min(rows - 1, Math.max(0, y));
  const left = Math.floor(column);
  const top = Math.floor(row);
  const right = Math.min(columns - 1, left + 1);
  const bottom = Math.min(rows - 1, top + 1);
  const blendX = column - left;
  const blendY = row - top;
  const upper =
    (field[top * columns + left] ?? 0) * (1 - blendX) +
    (field[top * columns + right] ?? 0) * blendX;
  const lower =
    (field[bottom * columns + left] ?? 0) * (1 - blendX) +
    (field[bottom * columns + right] ?? 0) * blendX;
  return upper + (lower - upper) * blendY;
};

const clampSmear = (velocity: number) =>
  Math.min(SMEAR_LIMIT, Math.max(-SMEAR_LIMIT, velocity)) * LENS_SMEAR;

export const packColor = ([red, green, blue]: Rgb) =>
  OPAQUE + blue * 0x1_00_00 + green * 0x1_00 + red;

export const paintDitherField = (
  grid: DitherFieldGrid,
  { lens, ramp, time }: DitherFieldFrame,
  pixels: Uint32Array,
  color: number
) => {
  const { bloom, columns, envelope, relief, rows, thresholds } = grid;
  const strength = lens.strength.value;
  const isLensOn = Math.abs(strength) >= SETTLED;
  const lensX = lens.x.value;
  const lensY = lens.y.value;
  const smearX = clampSmear(lens.x.velocity);
  const smearY = clampSmear(lens.y.velocity);
  const ripplePhase = time * RIPPLE_SPEED;
  for (let row = 0; row < rows; row += 1) {
    const offsetY = row - lensY;
    const isRowInLens = isLensOn && Math.abs(offsetY) < LENS_REACH;
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const cellEnvelope = envelope[index] ?? 0;
      if (cellEnvelope === 0) {
        pixels[index] = 0;
        continue;
      }
      const gain =
        ramp === 0 ? 1 : 1 + (bloomGain(bloom, column, row, time) - 1) * ramp;
      let tone = Math.min(1, (relief[index] ?? 0) * gain) * cellEnvelope;
      const offsetX = column - lensX;
      if (isRowInLens && Math.abs(offsetX) < LENS_REACH) {
        const distanceSquared = offsetX * offsetX + offsetY * offsetY;
        const falloff =
          Math.exp(-distanceSquared / (LENS_RADIUS * LENS_RADIUS)) * strength;
        const sampleX =
          column - offsetX * LENS_PULL * falloff - smearX * falloff;
        const sampleY = row - offsetY * LENS_PULL * falloff - smearY * falloff;
        const ripple = Math.sin(
          Math.sqrt(distanceSquared) * RIPPLE_WAVELENGTH - ripplePhase
        );
        const swell = falloff * (LENS_SWELL + LENS_RIPPLE * ripple);
        tone =
          Math.min(
            1,
            sampleAt(relief, columns, rows, sampleX, sampleY) * gain + swell
          ) *
          Math.min(
            cellEnvelope,
            sampleAt(envelope, columns, rows, sampleX, sampleY)
          );
      }
      pixels[index] = tone > (thresholds[index] ?? 1) ? color : 0;
    }
  }
};
