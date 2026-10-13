import { describe, expect, test } from "bun:test";

import type { CompanionInput, CompanionPose } from "./companion-motion";
import {
  createCompanionMotion,
  stepCompanion,
  swapSeconds,
} from "./companion-motion";

const frameStep = 1 / 60;
const rest = { scale: 1, x: 1200, y: 640, yaw: -0.32 };

const input = (overrides: Partial<CompanionInput>): CompanionInput => ({
  goal: rest,
  isReduced: false,
  pinned: null,
  restAction: "wave",
  role: "builder",
  scrollY: 0,
  step: frameStep,
  time: 0,
  ...overrides,
});

const run = (
  frames: number,
  from: number,
  make: (time: number, frame: number) => CompanionInput,
  state: ReturnType<typeof createCompanionMotion>
) => {
  const poses: CompanionPose[] = [];
  for (let frame = 0; frame < frames; frame += 1) {
    poses.push(stepCompanion(state, make(from + frame * frameStep, frame)));
  }
  return poses;
};

describe("stepCompanion", () => {
  test("swaps outfit once, mid spin, when the page role changes", () => {
    const state = createCompanionMotion("builder");
    run(60, 0, (time) => input({ time }), state);
    const poses = run(
      90,
      1,
      (time) => input({ role: "researcher", time }),
      state
    );
    const swaps = poses.filter((pose) => pose.cue.kind === "swap");
    expect(swaps).toHaveLength(1);
    expect(swaps[0]?.cue).toEqual({
      kind: "swap",
      role: "researcher",
      tossed: "builder",
    });
    const swapFrame = poses.findIndex((pose) => pose.cue.kind === "swap");
    expect(swapFrame * frameStep).toBeLessThan(swapSeconds);
    expect(Math.max(...poses.map((pose) => pose.spin))).toBeGreaterThan(5);
    expect(state.role).toBe("researcher");
  });

  test("stays at its dock while the page is still", () => {
    const state = createCompanionMotion("builder");
    const poses = run(120, 0, (time) => input({ time }), state);
    expect(state.x).toBe(rest.x);
    expect(state.y).toBeCloseTo(rest.y, 6);
    expect(poses.every((pose) => pose.action === "wave")).toBe(true);
    expect(Math.abs(poses.at(-1)?.lean ?? 1)).toBe(0);
  });

  test("trails a fast scroll with drift, lean and a walk, then settles back", () => {
    const state = createCompanionMotion("builder");
    run(10, 0, (time) => input({ time }), state);
    const scrolling = run(
      30,
      1,
      (time, frame) => input({ scrollY: (frame + 1) * 30, time }),
      state
    );
    const last = scrolling.at(-1);
    expect(last?.action).toBe("walk");
    expect(last?.lean).toBeLessThan(0);
    expect(state.y).toBeLessThan(rest.y);
    expect(rest.y - state.y).toBeLessThanOrEqual(36);
    const settled = run(240, 2, (time) => input({ scrollY: 900, time }), state);
    expect(settled.at(-1)?.action).toBe("wave");
    expect(Math.abs(state.y - rest.y)).toBeLessThan(1);
  });

  test("glides toward a new goal instead of jumping", () => {
    const state = createCompanionMotion("builder");
    run(10, 0, (time) => input({ time }), state);
    const away = { scale: 0.6, x: 1200, y: 888, yaw: -0.75 };
    run(6, 1, (time) => input({ goal: away, time }), state);
    expect(state.y).toBeGreaterThan(rest.y);
    expect(state.y).toBeLessThan(away.y);
    run(240, 2, (time) => input({ goal: away, time }), state);
    expect(state.y).toBeCloseTo(away.y, 0);
    expect(state.scale).toBeCloseTo(0.6, 2);
  });

  test("snaps to the goal with the new outfit and no motion under reduced motion", () => {
    const state = createCompanionMotion("builder");
    stepCompanion(state, input({ isReduced: true }));
    const goal = { scale: 0.6, x: 1180, y: 860, yaw: -0.75 };
    const pose = stepCompanion(
      state,
      input({
        goal,
        isReduced: true,
        restAction: "read",
        role: "researcher",
        scrollY: 4000,
        time: 1,
      })
    );
    expect(pose).toEqual({
      action: "read",
      cue: { kind: "wear", role: "researcher" },
      lean: 0,
      lift: 0,
      spin: 0,
      squash: 1,
    });
    expect(state).toMatchObject({ scale: 0.6, x: 1180, y: 860 });
  });

  test("changes outfit without ceremony while tucked away", () => {
    const state = createCompanionMotion("builder");
    const hidden = { ...rest, scale: 0 };
    const poses = run(
      40,
      0,
      (time) => input({ goal: hidden, role: "analyst", time }),
      state
    );
    expect(poses.some((pose) => pose.cue.kind === "swap")).toBe(false);
    expect(poses[0]?.cue).toEqual({ kind: "wear", role: "analyst" });
    expect(state.scale).toBeLessThan(0.05);
  });

  test("while operating a station the companion stays glued to the console through a fast scroll and plays the press pose", () => {
    const state = createCompanionMotion("builder");
    run(30, 0, (time) => input({ time }), state);
    const console = { scale: 0.67, x: 700, y: 520, yaw: -0.12 };
    const press = {
      action: "point",
      lean: 0.14,
      lift: -3,
      squash: 0.86,
      yaw: -0.12,
    } as const;
    const poses = run(
      20,
      0.5,
      (time, frame) =>
        input({
          goal: { ...console, y: console.y - frame * 30 },
          pinned: press,
          scrollY: frame * 30,
          time,
        }),
      state
    );
    expect(state.x).toBe(700);
    expect(state.y).toBe(520 - 19 * 30);
    expect(poses.at(-1)).toMatchObject({
      action: "point",
      lift: -3,
      squash: 0.86,
    });
  });
});
