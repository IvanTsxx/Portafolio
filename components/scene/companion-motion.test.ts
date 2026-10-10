import { describe, expect, test } from "bun:test";

import type { CompanionInput, CompanionPose } from "./companion-motion";
import {
  createCompanionMotion,
  stepCompanion,
  swapSeconds,
} from "./companion-motion";

const frameStep = 1 / 60;

const input = (overrides: Partial<CompanionInput>): CompanionInput => ({
  isHidden: false,
  isReduced: false,
  scrollY: 0,
  step: frameStep,
  stop: { role: "builder", side: "right" },
  target: { x: 1300, y: 800 },
  time: 0,
  ...overrides,
});

const run = (
  frames: number,
  from: number,
  make: (time: number) => CompanionInput,
  state: ReturnType<typeof createCompanionMotion>
) => {
  const poses: CompanionPose[] = [];
  for (let frame = 0; frame < frames; frame += 1) {
    poses.push(stepCompanion(state, make(from + frame * frameStep)));
  }
  return poses;
};

describe("stepCompanion", () => {
  test("swaps outfit once, mid spin, when the role changes", () => {
    const state = createCompanionMotion("builder");
    run(60, 0, (time) => input({ time }), state);
    const poses = run(
      90,
      1,
      (time) => input({ stop: { role: "debugger", side: "right" }, time }),
      state
    );
    const swaps = poses.filter((pose) => pose.cue.kind === "swap");
    expect(swaps).toHaveLength(1);
    expect(swaps[0]?.cue).toEqual({
      kind: "swap",
      role: "debugger",
      tossed: "builder",
    });
    const swapFrame = poses.findIndex((pose) => pose.cue.kind === "swap");
    expect(swapFrame * frameStep).toBeLessThan(swapSeconds);
    expect(Math.max(...poses.map((pose) => pose.spin))).toBeGreaterThan(5);
    expect(state.role).toBe("debugger");
  });

  test("walks to a new waypoint after settling instead of jumping", () => {
    const state = createCompanionMotion("builder");
    run(30, 0, (time) => input({ time }), state);
    const poses = run(
      10,
      1,
      (time) => input({ target: { x: 200, y: 400 }, time }),
      state
    );
    expect(poses.at(-1)?.action).toBe("walk");
    expect(state.travel.x).toBeGreaterThan(200);
    expect(state.travel.x).toBeLessThan(1300);
  });

  test("cuts straight to the waypoint with the new outfit under reduced motion", () => {
    const state = createCompanionMotion("builder");
    stepCompanion(state, input({ isReduced: true }));
    const pose = stepCompanion(
      state,
      input({
        isReduced: true,
        stop: { action: "read", role: "researcher", side: "left" },
        target: { x: 120, y: 500 },
        time: 1,
      })
    );
    expect(pose.cue).toEqual({ kind: "wear", role: "researcher" });
    expect(pose.action).toBe("read");
    expect(pose.spin).toBe(0);
    expect(pose.lift).toBe(0);
    expect(state.travel).toMatchObject({ isTraveling: false, x: 120, y: 500 });
  });

  test("changes outfit without ceremony while hidden behind a scene", () => {
    const state = createCompanionMotion("builder");
    const poses = run(
      40,
      0,
      (time) =>
        input({
          isHidden: true,
          stop: { role: "analyst", side: "right" },
          time,
        }),
      state
    );
    expect(poses.some((pose) => pose.cue.kind === "swap")).toBe(false);
    expect(poses[0]?.cue).toEqual({ kind: "wear", role: "analyst" });
    expect(state.scale).toBeLessThan(0.05);
  });
});
