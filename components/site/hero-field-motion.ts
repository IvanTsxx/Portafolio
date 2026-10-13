import {
  HERO_FIELD_CELLS,
  HERO_FIELD_COLUMNS,
  HERO_FIELD_ROWS,
} from "./hero-field-grid";
import type { HeroFieldBase } from "./hero-field-grid";

export const AMBIENT_FRAME_MS = 1000 / 30;
export const RAMP_SECONDS = 2.4;

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

const bloomLayers = [
  { scale: 1 / 34, weight: 0.6, x: 0.045, y: 0.018 },
  { scale: 1 / 21, weight: 0.4, x: -0.03, y: 0.035 },
] as const;

export interface Spring {
  value: number;
  velocity: number;
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
}

export const lensTravel: SpringConfig = { damping: 22, stiffness: 170 };
export const lensSwell: SpringConfig = { damping: 14, stiffness: 120 };

export interface HeroLens {
  strength: Spring;
  x: Spring;
  y: Spring;
}

export interface HeroFieldFrame {
  lens: HeroLens;
  ramp: number;
  time: number;
}

export interface HeroFieldMotion extends HeroFieldBase {
  bloom: Float32Array;
}

export const createHeroFieldMotion = (base: HeroFieldBase): HeroFieldMotion => {
  const bloom = new Float32Array(BLOOM_LATTICE * BLOOM_LATTICE);
  for (const index of bloom.keys()) {
    const wave =
      Math.sin((index + 1) * 12.9898 + base.seed * 78.233) * 43_758.5453;
    bloom[index] = wave - Math.floor(wave);
  }
  return { ...base, bloom };
};

export const createLens = (): HeroLens => ({
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

export const isLensSettled = ({ strength }: HeroLens) =>
  Math.abs(strength.value) < SETTLED && Math.abs(strength.velocity) < SETTLED;

export const rampAt = (seconds: number) => {
  const progress = Math.min(1, Math.max(0, seconds / RAMP_SECONDS));
  return progress * progress * (3 - 2 * progress);
};

const wrapLattice = (value: number) =>
  ((value % BLOOM_LATTICE) + BLOOM_LATTICE) % BLOOM_LATTICE;

const latticeAt = (bloom: Float32Array, x: number, y: number) =>
  bloom[wrapLattice(y) * BLOOM_LATTICE + wrapLattice(x)] ?? 0;

const bloomNoise = (bloom: Float32Array, x: number, y: number) => {
  const baseX = Math.floor(x);
  const baseY = Math.floor(y);
  const fractionX = x - baseX;
  const fractionY = y - baseY;
  const blendX = fractionX * fractionX * (3 - 2 * fractionX);
  const blendY = fractionY * fractionY * (3 - 2 * fractionY);
  const topLeft = latticeAt(bloom, baseX, baseY);
  const topRight = latticeAt(bloom, baseX + 1, baseY);
  const bottomLeft = latticeAt(bloom, baseX, baseY + 1);
  const bottomRight = latticeAt(bloom, baseX + 1, baseY + 1);
  const top = topLeft + (topRight - topLeft) * blendX;
  const bottom = bottomLeft + (bottomRight - bottomLeft) * blendX;
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
  return BLOOM_FLOOR + BLOOM_SPAN * contrast * contrast * (3 - 2 * contrast);
};

const sampleAt = (field: Float32Array, x: number, y: number) => {
  const column = Math.min(HERO_FIELD_COLUMNS - 1, Math.max(0, x));
  const row = Math.min(HERO_FIELD_ROWS - 1, Math.max(0, y));
  const left = Math.floor(column);
  const top = Math.floor(row);
  const right = Math.min(HERO_FIELD_COLUMNS - 1, left + 1);
  const bottom = Math.min(HERO_FIELD_ROWS - 1, top + 1);
  const blendX = column - left;
  const blendY = row - top;
  const upper =
    (field[top * HERO_FIELD_COLUMNS + left] ?? 0) * (1 - blendX) +
    (field[top * HERO_FIELD_COLUMNS + right] ?? 0) * blendX;
  const lower =
    (field[bottom * HERO_FIELD_COLUMNS + left] ?? 0) * (1 - blendX) +
    (field[bottom * HERO_FIELD_COLUMNS + right] ?? 0) * blendX;
  return upper + (lower - upper) * blendY;
};

const clampSmear = (velocity: number) =>
  Math.min(SMEAR_LIMIT, Math.max(-SMEAR_LIMIT, velocity)) * LENS_SMEAR;

export const paintHeroField = (
  motion: HeroFieldMotion,
  { lens, ramp, time }: HeroFieldFrame,
  pixels: Uint32Array,
  ink: number
) => {
  const { bloom, envelope, relief, thresholds } = motion;
  const strength = lens.strength.value;
  const isLensOn = Math.abs(strength) >= SETTLED;
  const lensX = lens.x.value;
  const lensY = lens.y.value;
  const smearX = clampSmear(lens.x.velocity);
  const smearY = clampSmear(lens.y.velocity);
  const ripplePhase = time * RIPPLE_SPEED;
  for (let row = 0; row < HERO_FIELD_ROWS; row += 1) {
    const offsetY = row - lensY;
    const isRowInLens = isLensOn && Math.abs(offsetY) < LENS_REACH;
    for (let column = 0; column < HERO_FIELD_COLUMNS; column += 1) {
      const index = row * HERO_FIELD_COLUMNS + column;
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
          Math.min(1, sampleAt(relief, sampleX, sampleY) * gain + swell) *
          Math.min(cellEnvelope, sampleAt(envelope, sampleX, sampleY));
      }
      pixels[index] = tone > (thresholds[index] ?? 1) ? ink : 0;
    }
  }
};

const OPAQUE = 0xff_00_00_00;

export const packInk = ([red, green, blue]: readonly [
  number,
  number,
  number,
]) => OPAQUE + blue * 0x1_00_00 + green * 0x1_00 + red;

export const heroFieldPixels = () => new Uint32Array(HERO_FIELD_CELLS);
