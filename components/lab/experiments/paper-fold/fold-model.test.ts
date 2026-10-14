import { describe, expect, test } from "bun:test";

import {
  closedAngle,
  dragTarget,
  panelAngle,
  panelLayouts,
  releaseTarget,
} from "./fold-model";

const anglesAt = (progress: number) =>
  panelLayouts.two.map((panel) => panelAngle(panel, progress));

describe("fold model", () => {
  test("panels cover the page exactly once", () => {
    for (const panels of Object.values(panelLayouts)) {
      const total = panels.reduce((sum, panel) => sum + panel.pageWidth, 0);
      expect(total).toBeCloseTo(1, 6);
      for (const [index, panel] of panels.entries()) {
        const previous = panels[index - 1];
        const expectedStart = previous
          ? previous.pageStart + previous.pageWidth
          : 0;
        expect(panel.pageStart).toBeCloseTo(expectedStart, 6);
      }
    }
  });

  test("an open sheet is flat and a closed one folds both flaps toward the viewer", () => {
    for (const angle of anglesAt(0)) {
      expect(Math.abs(angle)).toBe(0);
    }
    const [left, center, right] = anglesAt(1);
    expect(left).toBeCloseTo(closedAngle, 6);
    expect(center).toBe(0);
    expect(right).toBeCloseTo(-closedAngle, 6);
    expect(closedAngle).toBeLessThan(Math.PI);
  });

  test("the second flap waits for the first", () => {
    const [left, , right] = anglesAt(0.3);
    expect(left).toBeGreaterThan(0.5);
    expect(Math.abs(right ?? 1)).toBe(0);
  });

  test("overshooting past open bends back only a little", () => {
    const [left] = anglesAt(-1);
    expect(left).toBeLessThan(0);
    expect(left).toBeGreaterThan(-0.3);
  });

  test("dragging left folds and release snaps to the nearer state", () => {
    expect(dragTarget(0, -300, 600)).toBeCloseTo(0.8, 6);
    expect(dragTarget(0, 600, 600)).toBeCloseTo(-0.12, 6);
    expect(releaseTarget(0.4, 0)).toBe(0);
    expect(releaseTarget(0.4, 1)).toBe(1);
    expect(releaseTarget(0.7, -3)).toBe(0);
  });
});
