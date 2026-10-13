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

const panel = (height: number, parent = 0) => ({
  compact: false,
  height,
  parent,
});

const chip = (parent: number) => ({ compact: true, height: 32, parent });

describe("construction schedule", () => {
  const typicalBlocks = [
    panel(480),
    chip(1),
    chip(1),
    chip(1),
    chip(1),
    chip(1),
    panel(120),
    panel(120),
    chip(2),
    panel(200),
    chip(3),
    panel(300),
  ];

  test("a section of 4 to 12 blocks builds in 3.5 to 6 seconds", () => {
    for (let count = 4; count <= 12; count += 1) {
      const seconds = scheduleSeconds(
        constructionSchedule(typicalBlocks.slice(0, count))
      );
      expect(seconds).toBeGreaterThanOrEqual(3.5);
      expect(seconds).toBeLessThanOrEqual(6);
    }
  });

  test("a large block draws its frame, pauses, then prints for 1.2 to 2 seconds", () => {
    for (const height of [64, 200, 480, 1200]) {
      const [only] = constructionSchedule([panel(height)]);
      expect(only?.tool).toBe("gantry");
      expect(only?.frame).toBeCloseTo(0.5);
      expect(only?.pause).toBeGreaterThan(0);
      expect(only?.print).toBeGreaterThanOrEqual(1.2);
      expect(only?.print).toBeLessThanOrEqual(2);
    }
  });

  test("printing steps through a few legible layers", () => {
    for (const height of [64, 200, 480, 1200]) {
      const [only] = constructionSchedule([panel(height)]);
      const layers = only?.layers ?? 0;
      expect(layers).toBeGreaterThanOrEqual(4);
      expect(layers).toBeLessThanOrEqual(9);
      expect((only?.print ?? 0) / layers).toBeGreaterThanOrEqual(0.2);
    }
  });

  test("compact siblings share one quick pass in order", () => {
    const schedule = constructionSchedule(typicalBlocks);
    const chips = schedule.slice(1, 6);
    expect(new Set(chips.map((block) => block.pass)).size).toBe(1);
    expect(chips.every((block) => block.tool === "sweep")).toBe(true);
    for (const [index, block] of chips.entries()) {
      expect(block.start).toBeGreaterThan(chips[index - 1]?.start ?? -1);
    }
    expect(chips.at(-1)?.start ?? 0).toBeLessThan((chips[0]?.start ?? 0) + 0.5);
  });

  test("compact blocks under different parents start separate passes", () => {
    const [first, second] = constructionSchedule([chip(1), chip(2)]);
    expect(second?.pass).toBe((first?.pass ?? 0) + 1);
  });

  test("passes start in order, one after another", () => {
    const schedule = constructionSchedule(typicalBlocks);
    const passStarts = new Map<number, number>();
    for (const block of schedule) {
      passStarts.set(
        block.pass,
        Math.min(passStarts.get(block.pass) ?? block.start, block.start)
      );
    }
    const starts = [...passStarts.entries()]
      .toSorted(([first], [second]) => first - second)
      .map(([, start]) => start);
    expect(starts[0]).toBe(0);
    for (const [index, start] of starts.entries()) {
      expect(start).toBeGreaterThan(starts[index - 1] ?? -1);
    }
  });

  test("compact siblings split by a panel in reading order stay one pass", () => {
    const [first, panelBlock, second] = constructionSchedule([
      chip(1),
      panel(300),
      chip(1),
    ]);
    expect(second?.pass).toBe(first?.pass);
    expect(panelBlock?.pass).not.toBe(first?.pass);
    expect(second?.start).toBeGreaterThan(first?.start ?? 0);
  });

  test("taller blocks print longer and in more layers", () => {
    const [short, tall] = constructionSchedule([panel(120), panel(480, 1)]);
    expect(tall?.print).toBeGreaterThan(short?.print ?? 0);
    expect(tall?.layers).toBeGreaterThan(short?.layers ?? 0);
  });

  test("an empty section takes no time", () => {
    expect(scheduleSeconds(constructionSchedule([]))).toBe(0);
  });
});
