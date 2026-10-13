import { describe, expect, test } from "bun:test";

import type { Construction, ConstructionEvent } from "./section-construction";
import {
  advanceConstruction,
  blocksForBeat,
  idleConstruction,
  maxCompanionBeats,
} from "./section-construction";

const run = (events: readonly ConstructionEvent[]) => {
  let state: Construction = idleConstruction;
  for (const event of events) {
    state = advanceConstruction(state, event);
  }
  return state;
};

const beatsToBuild = (total: number) => {
  const groups: number[] = [];
  let placed = 0;
  while (placed < total) {
    const count = blocksForBeat(placed, total);
    groups.push(count);
    placed += count;
  }
  return groups;
};

describe("section construction", () => {
  test("a section moves idle, waiting, constructing, built", () => {
    expect(run([{ total: 2, type: "arm" }])).toEqual({
      phase: "waiting",
      total: 2,
    });
    expect(
      run([
        { total: 2, type: "arm" },
        { source: "companion", type: "begin" },
        { count: 1, type: "place" },
      ])
    ).toEqual({
      phase: "constructing",
      placed: 1,
      source: "companion",
      total: 2,
    });
    expect(
      run([
        { total: 2, type: "arm" },
        { source: "companion", type: "begin" },
        { count: 1, type: "place" },
        { count: 1, type: "place" },
      ])
    ).toEqual({ phase: "built" });
  });

  test("a built section never constructs again", () => {
    expect(
      run([
        { total: 3, type: "arm" },
        { type: "finish" },
        { total: 3, type: "arm" },
        { source: "self", type: "begin" },
      ])
    ).toEqual({ phase: "built" });
  });

  test("a section with no blocks is built as soon as it arms", () => {
    expect(run([{ total: 0, type: "arm" }])).toEqual({ phase: "built" });
  });

  test("placing before the construction begins changes nothing", () => {
    expect(
      run([
        { total: 2, type: "arm" },
        { count: 2, type: "place" },
      ])
    ).toEqual({ phase: "waiting", total: 2 });
  });

  test("a stalled companion hands the remaining blocks to the section", () => {
    expect(
      run([
        { total: 4, type: "arm" },
        { source: "companion", type: "begin" },
        { count: 1, type: "place" },
        { type: "handoff" },
      ])
    ).toEqual({ phase: "constructing", placed: 1, source: "self", total: 4 });
  });

  test("the companion lays every block within a few strikes", () => {
    expect(beatsToBuild(1)).toEqual([1]);
    expect(beatsToBuild(2)).toEqual([1, 1]);
    expect(beatsToBuild(3)).toEqual([1, 1, 1]);
    expect(beatsToBuild(7)).toEqual([2, 2, 3]);
    for (let total = 1; total <= 24; total += 1) {
      const groups = beatsToBuild(total);
      expect(groups.length).toBeLessThanOrEqual(maxCompanionBeats);
      expect(groups.reduce((sum, count) => sum + count, 0)).toBe(total);
    }
  });
});
