import { describe, expect, test } from "bun:test";

import type { Construction, ConstructionEvent } from "./section-construction";
import {
  advanceConstruction,
  constructionSchedule,
  idleConstruction,
  scheduleSeconds,
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
    expect(
      run([{ type: "arm" }, { total: 2, type: "begin" }, { type: "place" }])
    ).toEqual({ phase: "constructing", placed: 1, total: 2 });
    expect(
      run([
        { type: "arm" },
        { total: 2, type: "begin" },
        { type: "place" },
        { type: "place" },
      ])
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

  test("placing before the construction begins changes nothing", () => {
    expect(run([{ type: "arm" }, { type: "place" }])).toEqual({
      phase: "waiting",
    });
  });

  test("beginning before arming changes nothing", () => {
    expect(run([{ total: 2, type: "begin" }])).toEqual(idleConstruction);
  });
});

describe("construction schedule", () => {
  const typicalHeights = [480, 32, 32, 32, 32, 32, 120, 120, 64, 200, 44, 300];

  test("a section of 4 to 12 blocks builds in 2 to 3.5 seconds", () => {
    for (let count = 4; count <= 12; count += 1) {
      const seconds = scheduleSeconds(
        constructionSchedule(typicalHeights.slice(0, count))
      );
      expect(seconds).toBeGreaterThanOrEqual(2);
      expect(seconds).toBeLessThanOrEqual(3.5);
    }
  });

  test("blocks start in order, one after another", () => {
    const starts = constructionSchedule(typicalHeights).map(
      (block) => block.start
    );
    expect(starts[0]).toBe(0);
    for (const [index, start] of starts.entries()) {
      expect(start).toBeGreaterThan(starts[index - 1] ?? -1);
    }
  });

  test("taller blocks print longer and in more layers", () => {
    const [short, tall] = constructionSchedule([32, 480]);
    expect(tall?.print).toBeGreaterThan(short?.print ?? 0);
    expect(tall?.layers).toBeGreaterThan(short?.layers ?? 0);
  });

  test("a lone block still draws its frame before it prints", () => {
    const [only] = constructionSchedule([200]);
    expect(only?.start).toBe(0);
    expect(only?.frame).toBeGreaterThan(0);
    expect(only?.print).toBeGreaterThan(0);
  });

  test("an empty section takes no time", () => {
    expect(scheduleSeconds(constructionSchedule([]))).toBe(0);
  });
});
