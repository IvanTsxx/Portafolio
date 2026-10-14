import { describe, expect, test } from "bun:test";

import {
  chainSegments,
  contourInterval,
  contourSegments,
  elevationMetres,
  formHeight,
  sampleField,
} from "./contours";

const center = 32;
const cone = sampleField(65, 65, (column, row) =>
  Math.hypot(column - center, row - center)
);

const segmentLength = ([x1, y1, x2, y2]: readonly number[]) =>
  Math.hypot((x2 ?? 0) - (x1 ?? 0), (y2 ?? 0) - (y1 ?? 0));

describe("contour segments", () => {
  test("a cone traces a circle at the requested radius", () => {
    const radius = 20;
    const segments = contourSegments(cone, radius);
    for (const [x1, y1, x2, y2] of segments) {
      expect(Math.hypot(x1 - center, y1 - center)).toBeCloseTo(radius, 0);
      expect(Math.hypot(x2 - center, y2 - center)).toBeCloseTo(radius, 0);
    }
    const length = segments.reduce(
      (total, segment) => total + segmentLength(segment),
      0
    );
    expect(Math.abs(length / (2 * Math.PI * radius) - 1)).toBeLessThan(0.02);
  });

  test("chaining joins a closed contour into one line", () => {
    const segments = contourSegments(cone, 20.5);
    const lines = chainSegments(segments);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveLength((segments.length + 1) * 2);
    expect(lines[0]?.slice(0, 2)).toEqual(lines[0]?.slice(-2));
  });

  test("a flat field has no contours", () => {
    const flat = sampleField(16, 16, () => 0.4);
    expect(contourSegments(flat, 0.5)).toHaveLength(0);
    expect(contourSegments(flat, 0.3)).toHaveLength(0);
  });

  test("the lit form is brightest near its highlight", () => {
    expect(formHeight(-0.12, 0.13)).toBeGreaterThan(formHeight(0.2, -0.15));
    expect(elevationMetres(formHeight(-0.12, 0.13))).toBeGreaterThan(600);
  });

  test("the form's relief has no cliff at its rim", () => {
    let steepest = 0;
    for (let step = 0; step < 4000; step += 1) {
      const angle = (step / 4000) * Math.PI * 2;
      for (let radius = 0.2; radius < 0.5; radius += 0.002) {
        const x = Math.cos(angle) * radius;
        const y = 0.04 + Math.sin(angle) * radius;
        const outward =
          formHeight(x + Math.cos(angle) * 0.002, y + Math.sin(angle) * 0.002) -
          formHeight(x, y);
        steepest = Math.max(steepest, Math.abs(outward));
      }
    }
    expect(steepest).toBeLessThan(0.05);
  });

  test("interval labels follow the level count", () => {
    expect(contourInterval(20)).toBe(50);
    expect(contourInterval(40)).toBe(25);
  });
});
