import { describe, expect, test } from "bun:test";

import {
  formatDates,
  progressOfStep,
  stairs,
  stepAtProgress,
} from "./stairs-model";

describe("experience stairs", () => {
  test("climb from the oldest job to the current one", () => {
    expect(stairs.map((stair) => stair.company)).toEqual([
      "Doctor Qali",
      "Tensolite SA",
      "Aliva Shop",
      "basement studio",
    ]);
    expect(stairs.map((stair) => stair.isCurrent)).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  test("engrave the start year and dress a different role per step", () => {
    expect(stairs.map((stair) => stair.year)).toEqual([
      "2023",
      "2023",
      "2025",
      "2026",
    ]);
    expect(stairs.map((stair) => stair.cast.role)).toEqual([
      "builder",
      "inspector",
      "architect",
      "orchestrator",
    ]);
  });

  test("format dates as month and year, open ended for the current job", () => {
    expect(formatDates("2026-04", null)).toBe("Apr 2026 → now");
    expect(formatDates("2023-01", "2023-06")).toBe("Jan 2023 → Jun 2023");
  });

  test("map scroll progress to one step at a time", () => {
    expect(
      [0, 0.24, 0.25, 0.6, 0.99, 1].map((p) => stepAtProgress(p, 4))
    ).toEqual([0, 0, 1, 2, 3, 3]);
    expect(stepAtProgress(progressOfStep(2, 4), 4)).toBe(2);
  });
});
