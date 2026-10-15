import { describe, expect, test } from "bun:test";

import type { Construction, ConstructionEvent } from "./section-construction";
import {
  advanceConstruction,
  buildDeadlineSeconds,
  buildSeconds,
  buildStagger,
  idleConstruction,
  startsHidden,
} from "./section-construction";

const run = (events: readonly ConstructionEvent[]) => {
  let state: Construction = idleConstruction;
  for (const event of events) {
    state = advanceConstruction(state, event);
  }
  return state;
};

describe("section construction", () => {
  test("a section moves idle, waiting, constructing, built", () => {
    expect(run([{ type: "arm" }])).toEqual({ phase: "waiting" });
    expect(run([{ type: "arm" }, { total: 2, type: "begin" }])).toEqual({
      phase: "constructing",
      total: 2,
    });
    expect(
      run([{ type: "arm" }, { total: 2, type: "begin" }, { type: "finish" }])
    ).toEqual({ phase: "built" });
  });

  test("a built section never constructs again", () => {
    expect(
      run([
        { type: "arm" },
        { type: "finish" },
        { type: "arm" },
        { total: 3, type: "begin" },
      ])
    ).toEqual({ phase: "built" });
  });

  test("a section that finds no blocks is built as soon as it begins", () => {
    expect(run([{ type: "arm" }, { total: 0, type: "begin" }])).toEqual({
      phase: "built",
    });
  });

  test("beginning before arming changes nothing", () => {
    expect(run([{ total: 2, type: "begin" }])).toEqual(idleConstruction);
  });
});

describe("build timing", () => {
  test("a section of any size builds within half a second", () => {
    for (let count = 1; count <= 60; count += 1) {
      expect(buildSeconds(count)).toBeGreaterThan(0);
      expect(buildSeconds(count)).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  test("blocks follow each other at most 40 ms apart", () => {
    for (let count = 2; count <= 60; count += 1) {
      expect(buildStagger(count)).toBeGreaterThan(0);
      expect(buildStagger(count)).toBeLessThanOrEqual(0.04);
    }
  });

  test("a single block and an empty section have no stagger", () => {
    expect(buildStagger(1)).toBe(0);
    expect(buildSeconds(0)).toBe(0);
  });

  test("content is forced in at most 300 ms after its build should have ended", () => {
    for (let count = 0; count <= 60; count += 1) {
      expect(buildDeadlineSeconds(count) - buildSeconds(count)).toBeCloseTo(
        0.3
      );
      expect(buildDeadlineSeconds(count)).toBeLessThanOrEqual(0.8);
    }
  });

  test("a section on screen or above it when the page loads is never hidden", () => {
    expect(startsHidden(-400, 800)).toBe(false);
    expect(startsHidden(0, 800)).toBe(false);
    expect(startsHidden(600, 800)).toBe(false);
    expect(startsHidden(800, 800)).toBe(true);
    expect(startsHidden(2400, 800)).toBe(true);
  });
});
