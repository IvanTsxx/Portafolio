import { describe, expect, test } from "bun:test";

import { posterLight } from "@/components/lab/source/form-tone";
import { formRaster } from "@/components/lab/source/ink-raster";

import { createHatchPlanner, penAt, traceSpan } from "./hatch-plan";
import type { HatchPlan } from "./hatch-plan";

const settings = { angle: Math.PI / 4, layers: 3, pitch: 6 };
const raster = formRaster(160, 90, posterLight);

const planAll = (layers = 3) => {
  const planner = createHatchPlanner(raster, 4, { ...settings, layers });
  planner.step(() => true);
  return planner;
};

const tracedLength = (plan: HatchPlan, from: number, to: number) => {
  let total = 0;
  let headX = 0;
  let headY = 0;
  traceSpan(
    {
      lineTo: (x, y) => {
        total += Math.hypot(x - headX, y - headY);
      },
      moveTo: (x, y) => {
        headX = x;
        headY = y;
      },
    },
    plan,
    from,
    to
  );
  return total;
};

describe("hatch planner", () => {
  test("blank paper plans no strokes", () => {
    const paper = { height: 10, ink: new Float32Array(100), width: 10 };
    const planner = createHatchPlanner(paper, 4, settings);
    planner.step(() => true);
    expect(planner.isDone()).toBe(true);
    expect(planner.plan.count).toBe(0);
  });

  test("each extra layer adds strokes in the shadows", () => {
    const counts = [1, 2, 3].map((layers) => planAll(layers).plan.count);
    expect(counts[0]).toBeGreaterThan(0);
    expect(counts[1]).toBeGreaterThan(counts[0] ?? 0);
    expect(counts[2]).toBeGreaterThan(counts[1] ?? 0);
  });

  test("planning in one-line slices gives the same plan", () => {
    const whole = planAll().plan;
    const planner = createHatchPlanner(raster, 4, settings);
    let slices = 0;
    while (!planner.isDone()) {
      let budget = 1;
      planner.step(() => {
        budget -= 1;
        return budget >= 0;
      });
      slices += 1;
    }
    expect(slices).toBeGreaterThan(10);
    expect(planner.plan.count).toBe(whole.count);
    expect(planner.plan.timelineLength).toBeCloseTo(whole.timelineLength, 3);
  });

  test("playback pieces add up to the inked strokes", () => {
    const { plan } = planAll();
    let inkLength = 0;
    for (let stroke = 0; stroke < plan.count; stroke += 1) {
      const base = stroke * 4;
      inkLength += Math.hypot(
        (plan.segments[base + 2] ?? 0) - (plan.segments[base] ?? 0),
        (plan.segments[base + 3] ?? 0) - (plan.segments[base + 1] ?? 0)
      );
    }
    const cut = plan.timelineLength * 0.37;
    const pieces =
      tracedLength(plan, 0, cut) + tracedLength(plan, cut, plan.timelineLength);
    expect(plan.timelineLength).toBeGreaterThan(inkLength);
    expect(pieces).toBeCloseTo(inkLength, 1);
  });

  test("between strokes the pen travels lifted toward the next stroke", () => {
    const { plan } = planAll();
    const stroke = 5;
    const base = stroke * 4;
    const travelStart = plan.ends[stroke - 1] ?? 0;
    const strokeLength = Math.hypot(
      (plan.segments[base + 2] ?? 0) - (plan.segments[base] ?? 0),
      (plan.segments[base + 3] ?? 0) - (plan.segments[base + 1] ?? 0)
    );
    const travelEnd = (plan.ends[stroke] ?? 0) - strokeLength;
    const middle = penAt(plan, (travelStart + travelEnd) / 2);
    expect(middle?.x).toBeCloseTo(
      ((plan.segments[base - 2] ?? 0) + (plan.segments[base] ?? 0)) / 2,
      3
    );
    expect(tracedLength(plan, travelStart, travelEnd)).toBe(0);
  });

  test("the pen ends on the last stroke's end point", () => {
    const { plan } = planAll();
    const last = (plan.count - 1) * 4;
    expect(penAt(plan, plan.timelineLength)).toEqual({
      x: plan.segments[last + 2] ?? 0,
      y: plan.segments[last + 3] ?? 0,
    });
  });
});
