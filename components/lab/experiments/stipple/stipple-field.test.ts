import { describe, expect, test } from "bun:test";

import { posterLight } from "@/components/lab/source/form-tone";
import { formRaster } from "@/components/lab/source/ink-raster";

import {
  createStippleField,
  isStippleSettled,
  relaxStipple,
  setStippleCount,
  stirStipple,
  weightAt,
} from "./stipple-field";
import type { StippleField } from "./stipple-field";

const raster = formRaster(160, 90, posterLight);

const settle = (field: StippleField, maxIterations = 200) => {
  while (!isStippleSettled(field) && field.iterations < maxIterations) {
    relaxStipple(field, () => true);
  }
};

const nearestGap = (field: StippleField) => {
  let total = 0;
  for (let point = 0; point < field.count; point += 1) {
    let best = Number.POSITIVE_INFINITY;
    for (let other = 0; other < field.count; other += 1) {
      if (other !== point) {
        best = Math.min(
          best,
          Math.hypot(
            (field.points[point * 2] ?? 0) - (field.points[other * 2] ?? 0),
            (field.points[point * 2 + 1] ?? 0) -
              (field.points[other * 2 + 1] ?? 0)
          )
        );
      }
    }
    total += best;
  }
  return total / field.count;
};

const meanWeightUnderDots = (field: StippleField) => {
  let total = 0;
  for (let point = 0; point < field.count; point += 1) {
    total += weightAt(
      field,
      field.points[point * 2] ?? 0,
      field.points[point * 2 + 1] ?? 0
    );
  }
  return total / field.count;
};

describe("stipple field", () => {
  test("relaxation spreads clumped random dots apart and settles", () => {
    const field = createStippleField(raster, 600);
    const before = nearestGap(field);
    settle(field);
    expect(isStippleSettled(field)).toBe(true);
    expect(nearestGap(field)).toBeGreaterThan(before * 1.3);
  });

  test("dots gather where the form is dark", () => {
    const field = createStippleField(raster, 600);
    settle(field);
    let averageWeight = 0;
    for (const weight of field.weights) {
      averageWeight += weight;
    }
    averageWeight /= field.weights.length * field.weightPeak;
    expect(meanWeightUnderDots(field)).toBeGreaterThan(averageWeight * 1.8);
  });

  test("one iteration matches a brute-force weighted Lloyd step", () => {
    const field = createStippleField(raster, 250, 11);
    relaxStipple(field, () => true);
    const reference = createStippleField(raster, 250, 11);
    const sums = new Float64Array(reference.count * 3);
    for (let row = 0; row < reference.height; row += 1) {
      for (let column = 0; column < reference.width; column += 1) {
        const weight = reference.weights[row * reference.width + column] ?? 0;
        if (weight < 0.002) {
          continue;
        }
        let best = 0;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let point = 0; point < reference.count; point += 1) {
          const distance =
            ((reference.points[point * 2] ?? 0) - column - 0.5) ** 2 +
            ((reference.points[point * 2 + 1] ?? 0) - row - 0.5) ** 2;
          if (distance < bestDistance) {
            bestDistance = distance;
            best = point;
          }
        }
        sums[best * 3] = (sums[best * 3] ?? 0) + weight;
        sums[best * 3 + 1] =
          (sums[best * 3 + 1] ?? 0) + weight * (column + 0.5);
        sums[best * 3 + 2] = (sums[best * 3 + 2] ?? 0) + weight * (row + 0.5);
      }
    }
    for (let point = 0; point < reference.count; point += 1) {
      const mass = sums[point * 3] ?? 0;
      if (mass > 0) {
        expect(field.points[point * 2]).toBeCloseTo(
          (sums[point * 3 + 1] ?? 0) / mass,
          3
        );
        expect(field.points[point * 2 + 1]).toBeCloseTo(
          (sums[point * 3 + 2] ?? 0) / mass,
          3
        );
      }
    }
  });

  test("slicing an iteration by rows gives the same result", () => {
    const whole = createStippleField(raster, 300, 3);
    const sliced = createStippleField(raster, 300, 3);
    relaxStipple(whole, () => true);
    let slices = 0;
    let finished = false;
    while (!finished) {
      let rows = 4;
      finished = relaxStipple(sliced, () => {
        rows -= 1;
        return rows >= 0;
      });
      slices += 1;
    }
    expect(slices).toBeGreaterThan(10);
    expect([...sliced.points]).toEqual([...whole.points]);
  });

  test("stirring unsettles the field and it settles again", () => {
    const field = createStippleField(raster, 400);
    settle(field);
    expect(stirStipple(field, 80, 48, 6, 0, 20)).toBe(true);
    expect(isStippleSettled(field)).toBe(false);
    settle(field, field.iterations + 200);
    expect(isStippleSettled(field)).toBe(true);
  });

  test("changing the count keeps existing dots in place", () => {
    const field = createStippleField(raster, 200);
    settle(field);
    const kept = [...field.points.subarray(0, 100 * 2)];
    setStippleCount(field, 100);
    expect([...field.points]).toEqual(kept);
    setStippleCount(field, 300);
    expect(field.count).toBe(300);
    expect([...field.points.subarray(0, 200)]).toEqual(kept);
  });
});
