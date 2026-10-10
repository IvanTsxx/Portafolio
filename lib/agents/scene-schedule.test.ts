import { describe, expect, test } from "bun:test";

import type { SceneSchedule, SceneScheduleEvent } from "./scene-schedule";
import {
  createSceneSchedule,
  sceneDwellMs,
  shownSceneIndex,
  stepSceneSchedule,
} from "./scene-schedule";

const count = 4;

const play = (schedule: SceneSchedule, events: SceneScheduleEvent[]) => {
  let state = schedule;
  for (const event of events) {
    state = stepSceneSchedule(state, event, count);
  }
  return state;
};

describe("stepSceneSchedule", () => {
  test("holds a scene for the full dwell before switching", () => {
    const start = createSceneSchedule(0, 0);
    const early = play(start, [
      { index: 3, kind: "scroll" },
      { kind: "tick", now: sceneDwellMs - 1 },
    ]);
    expect(shownSceneIndex(early)).toBe(0);
    const due = stepSceneSchedule(
      early,
      { kind: "tick", now: sceneDwellMs },
      count
    );
    expect(shownSceneIndex(due)).toBe(1);
  });

  test("walks a fast scroll one scene per dwell without skipping", () => {
    let state = play(createSceneSchedule(0, 0), [
      { index: 1, kind: "scroll" },
      { index: 2, kind: "scroll" },
      { index: 3, kind: "scroll" },
    ]);
    const shown: number[] = [];
    for (let step = 1; step <= 3; step += 1) {
      state = stepSceneSchedule(
        state,
        { kind: "tick", now: step * sceneDwellMs },
        count
      );
      shown.push(shownSceneIndex(state));
    }
    expect(shown).toEqual([1, 2, 3]);
    expect(state.target).toBeNull();
  });

  test("auto-advances and wraps when nothing is queued", () => {
    let state = createSceneSchedule(3, 0);
    state = stepSceneSchedule(
      state,
      { kind: "tick", now: sceneDwellMs },
      count
    );
    expect(shownSceneIndex(state)).toBe(0);
  });

  test("pins immediately and holds while pinned", () => {
    let state = play(createSceneSchedule(0, 0), [
      { index: 2, kind: "pin", now: 100 },
      { kind: "tick", now: sceneDwellMs * 5 },
    ]);
    expect(shownSceneIndex(state)).toBe(2);
    state = play(state, [
      { kind: "unpin", now: sceneDwellMs * 5 },
      { kind: "tick", now: sceneDwellMs * 5 + 10 },
    ]);
    expect(shownSceneIndex(state)).toBe(2);
    state = stepSceneSchedule(
      state,
      { kind: "tick", now: sceneDwellMs * 6 },
      count
    );
    expect(shownSceneIndex(state)).toBe(3);
  });

  test("a repeated scroll index queues nothing", () => {
    const state = play(createSceneSchedule(1, 0), [
      { index: 1, kind: "scroll" },
    ]);
    expect(state.target).toBeNull();
  });
});
