import { describe, expect, test } from "bun:test";

import {
  foldCorner,
  openTip,
  peeledShare,
  polygonArea,
  restingTip,
  settleAxis,
  toClipPath,
} from "@/registry/ivan/lib/page-fold";

const stage = { height: 900, width: 1440 };

const area = polygonArea;

describe("page fold", () => {
  test("a resting dog-ear folds a right triangle with equal legs", () => {
    const fold = foldCorner(stage, restingTip(stage, 28));
    expect(fold.peeled).toHaveLength(3);
    expect(area(fold.peeled)).toBeCloseTo((28 * 28) / 2, 3);
    expect(area(fold.flap)).toBeCloseTo(area(fold.peeled), 3);
  });

  test("the folded corner lands on the pointer", () => {
    const tip = { x: 900, y: 500 };
    const fold = foldCorner(stage, tip);
    const landed = fold.flap.some(
      (point) =>
        Math.abs(point.x - tip.x) < 1e-6 && Math.abs(point.y - tip.y) < 1e-6
    );
    expect(landed).toBe(true);
  });

  test("fully open leaves one neat fold in the opposite corner", () => {
    const fold = foldCorner(stage, openTip(stage, 64));
    const total = stage.width * stage.height;
    expect(area(fold.peeled)).toBeCloseTo(total - (64 * 64) / 2, 3);
    const visibleFlap = fold.flap.filter(
      (point) => point.x >= -1e-6 && point.y >= -1e-6
    );
    expect(visibleFlap.length).toBeGreaterThan(0);
    for (const point of visibleFlap) {
      expect(point.x + point.y).toBeLessThanOrEqual(64 + 1e-6);
    }
  });

  test("the peeled share runs from almost nothing at rest to almost all when open", () => {
    expect(peeledShare(stage, restingTip(stage, 28))).toBeLessThan(0.001);
    expect(peeledShare(stage, openTip(stage, 64))).toBeGreaterThan(0.99);
  });

  test("the settle curve keeps the release speed but never passes its target", () => {
    for (const velocity of [null, 0, 400, 9000, -9000]) {
      const curve = settleAxis(0, 100, velocity, 0.56);
      let peak = Number.NEGATIVE_INFINITY;
      for (let step = 0; step <= 100; step += 1) {
        peak = Math.max(peak, curve(step / 100));
      }
      expect(peak).toBeLessThanOrEqual(100 + 1e-9);
      expect(curve(1)).toBe(100);
    }
    const slow = settleAxis(0, 100, 0, 0.56);
    const thrown = settleAxis(0, 100, 400, 0.56);
    expect(thrown(0.05)).toBeGreaterThan(slow(0.05));
  });

  test("an empty polygon clips everything", () => {
    expect(toClipPath([])).toBe("polygon(0 0, 0 0, 0 0)");
  });
});
