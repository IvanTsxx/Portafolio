import { describe, expect, test } from "bun:test";

import {
  budgetDustCount,
  buildDustField,
  coverCrop,
  planDustGrid,
} from "@/registry/ivan/components/dust-portrait/dust-portrait-field";
import { DustTrail } from "@/registry/ivan/components/dust-portrait/dust-portrait-trail";

const runFor = (trail: DustTrail, seconds: number) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) {
    trail.advance(1 / 60);
  }
};

describe("dust portrait field", () => {
  test("the grid keeps the stage shape and the particle budget", () => {
    const { cols, rows } = planDustGrid(90_000, 16 / 10);
    expect(Math.abs(cols / rows - 1.6)).toBeLessThan(0.02);
    expect(Math.abs(cols * rows - 90_000) / 90_000).toBeLessThan(0.02);
  });

  test("small stages get fewer grains than the device budget", () => {
    expect(budgetDustCount(120_000, 1, 200, 200)).toBeLessThan(20_000);
    expect(budgetDustCount(120_000, 1, 1400, 900)).toBe(120_000);
    expect(budgetDustCount(120_000, 0, 1400, 900)).toBe(8000);
  });

  test("the cover crop matches the stage shape and stays on the focus", () => {
    const wide = coverCrop(1000, 1000, 2, { x: 0.5, y: 0 });
    expect(wide).toEqual({ sh: 500, sw: 1000, sx: 0, sy: 0 });
    const tall = coverCrop(1000, 1000, 0.5, { x: 1, y: 0.5 });
    expect(tall).toEqual({ sh: 1000, sw: 500, sx: 500, sy: 0 });
  });

  test("grains land only where the picture has a mark", () => {
    const pixels = new Uint8ClampedArray([
      0, 0, 0, 255, 255, 255, 255, 255, 128, 128, 128, 255, 0, 0, 0, 255,
    ]);
    const lit = buildDustField(pixels, { cols: 2, rows: 2 }, true);
    expect(lit.count).toBe(2);
    expect(lit.positions[2]).toBeCloseTo(1, 3);
    const inked = buildDustField(pixels, { cols: 2, rows: 2 }, false);
    expect(inked.count).toBe(3);
    expect(inked.positions[0]).toBeCloseTo(0.25, 3);
    expect(inked.positions[1]).toBeCloseTo(0.75, 3);
  });
});

describe("dust trail", () => {
  test("rises under the pointer and settles about 800 ms after it leaves", () => {
    const trail = new DustTrail();
    trail.aim(0.5, 0.5);
    runFor(trail, 0.3);
    expect(trail.strength).toBeGreaterThan(0.9);
    expect(trail.isSettled).toBe(false);
    trail.release();
    runFor(trail, 0.4);
    expect(trail.isSettled).toBe(false);
    runFor(trail, 0.9);
    expect(trail.isSettled).toBe(true);
  });

  test("clear drops every mark at once", () => {
    const trail = new DustTrail();
    trail.aim(0.2, 0.2);
    runFor(trail, 0.2);
    trail.aim(0.6, 0.6);
    runFor(trail, 0.2);
    trail.clear();
    expect(trail.isSettled).toBe(true);
    expect(trail.uniform.every((mark) => mark.z === 0)).toBe(true);
  });
});
