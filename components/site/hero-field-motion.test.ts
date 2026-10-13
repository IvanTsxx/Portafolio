import { describe, expect, test } from "bun:test";

import {
  HERO_FIELD_CELLS,
  HERO_FIELD_COLUMNS,
  heroFieldBase,
  heroFieldCells,
} from "./hero-field-grid";
import {
  createHeroFieldMotion,
  createLens,
  heroFieldPixels,
  isLensSettled,
  lensSwell,
  paintHeroField,
  rampAt,
  stepSpring,
} from "./hero-field-motion";
import type { HeroLens } from "./hero-field-motion";

const INK = 1;
const motion = createHeroFieldMotion(heroFieldBase("GH-02"));

const paint = (time: number, lens: HeroLens = createLens()) => {
  const pixels = heroFieldPixels();
  paintHeroField(motion, { lens, ramp: rampAt(time), time }, pixels, INK);
  return pixels;
};

const pressedLens = (x: number, y: number, velocity = 0): HeroLens => ({
  strength: { value: 1, velocity: 0 },
  x: { value: x, velocity },
  y: { value: y, velocity },
});

const changedCells = (a: Uint32Array, b: Uint32Array) =>
  [...a.keys()].filter((index) => a[index] !== b[index]);

const sampleTimes = [0.6, 3, 9, 27, 81, 243];

describe("hero field motion", () => {
  test("the first live frame matches the static svg cell for cell", () => {
    const staticCells = heroFieldCells(motion);
    const live = paint(0);
    expect(changedCells(live, Uint32Array.from(staticCells))).toEqual([]);
  });

  test("the field breathes over time", () => {
    const settled = paint(30);
    const later = paint(45);
    expect(changedCells(settled, later).length).toBeGreaterThan(200);
  });

  test("ink never leaves the density envelope, even under a fast lens", () => {
    const lenses = [
      createLens(),
      pressedLens(60, 10, 60),
      pressedLens(150, 30, -60),
    ];
    for (const time of sampleTimes) {
      for (const lens of lenses) {
        const pixels = paint(time, lens);
        for (let index = 0; index < HERO_FIELD_CELLS; index += 1) {
          if (pixels[index]) {
            expect(motion.thresholds[index] ?? 1).toBeLessThan(
              motion.envelope[index] ?? 0
            );
          }
        }
      }
    }
  });

  test("the title side and the bottom stay clear", () => {
    for (const time of sampleTimes) {
      const pixels = paint(time, pressedLens(54, 60, 60));
      for (const index of pixels.keys()) {
        const column = index % HERO_FIELD_COLUMNS;
        const row = Math.floor(index / HERO_FIELD_COLUMNS);
        if (column < 54 || row >= 58) {
          expect(pixels[index]).toBe(0);
        }
      }
    }
  });

  test("the lens only distorts cells near the pointer", () => {
    const lensX = 150;
    const lensY = 20;
    const changed = changedCells(
      paint(12),
      paint(12, pressedLens(lensX, lensY))
    );
    expect(changed.length).toBeGreaterThan(40);
    for (const index of changed) {
      const column = index % HERO_FIELD_COLUMNS;
      const row = Math.floor(index / HERO_FIELD_COLUMNS);
      expect(Math.hypot(column - lensX, row - lensY)).toBeLessThan(42);
    }
  });

  test("the lens springs back to rest after the pointer leaves", () => {
    const lens = pressedLens(150, 20);
    for (let frame = 0; frame < 180; frame += 1) {
      stepSpring(lens.strength, 0, lensSwell, 1 / 60);
    }
    expect(isLensSettled(lens)).toBe(true);
    expect(changedCells(paint(12), paint(12, lens))).toEqual([]);
  });
});
