import { describe, expect, test } from "bun:test";

import {
  advance,
  carriedAlpha,
  hitOf,
  holdStepOf,
  isSettled,
  jumpTo,
  nestView,
  restLine,
  STATION_COUNT,
  watchedStep,
} from "./line-model";
import type { Line } from "./line-model";

const run = (
  from: Line,
  seconds: number,
  drive: { stopAt: number | null; watched: number }
) => {
  let line = from;
  for (let clock = 0; clock < seconds; clock += 1 / 60) {
    line = advance(line, 1 / 60, drive);
  }
  return line;
};

describe("indexing line", () => {
  test("every nest moves one station per cycle and wraps after six", () => {
    const steps: number[] = [];
    let line = restLine;
    for (let cycle = 0; cycle < STATION_COUNT + 1; cycle += 1) {
      steps.push(watchedStep(line, 0));
      line = run(line, 3.6, { stopAt: null, watched: 0 });
    }
    expect(steps).toEqual([0, 1, 2, 3, 4, 5, 0]);
  });

  test("a part only exists between load and merge, carrying every step it passed", () => {
    const before: Line = { phase: "dwell", t: hitOf(3) - 0.01, turns: 3 };
    const after: Line = { ...before, t: hitOf(3) + 0.01 };
    expect(nestView(0, before).stage).toBe(2);
    expect(nestView(0, after).stage).toBe(3);
    expect(nestView(0, { phase: "dwell", t: 0, turns: 0 }).stage).toBe(-1);
    expect(nestView(0, { phase: "index", t: 0.5, turns: 5 }).alpha).toBe(0);
    expect(nestView(0, { phase: "dwell", t: 1, turns: 5 }).alpha).toBe(0);
  });

  test("the loader carries a blank until it lands in the nest", () => {
    expect(carriedAlpha({ phase: "dwell", t: 0, turns: 0 })).toBe(1);
    expect(carriedAlpha({ phase: "dwell", t: hitOf(0), turns: 0 })).toBe(0);
    expect(nestView(0, { phase: "dwell", t: hitOf(0), turns: 0 }).alpha).toBe(
      1
    );
  });

  test("seeking a step runs the watched part there and holds after its work", () => {
    const line = run(restLine, 20, { stopAt: 4, watched: 0 });
    expect(watchedStep(line, 0)).toBe(4);
    expect(isSettled(line, 0, 4)).toBe(true);
    expect(run(line, 5, { stopAt: 4, watched: 0 })).toEqual(line);
  });

  test("a hold mid-turn settles on the station the part is turning to", () => {
    const turning: Line = { phase: "index", t: 0.4, turns: 2 };
    expect(holdStepOf(turning, 0)).toBe(3);
    expect(holdStepOf({ phase: "dwell", t: 0.4, turns: 2 }, 0)).toBe(2);
  });

  test("a jump lands on the step with its work done", () => {
    const line = jumpTo({ phase: "index", t: 0.3, turns: 7 }, 2, 1);
    expect(watchedStep(line, 2)).toBe(1);
    expect(nestView(2, line).stage).toBe(1);
  });
});
