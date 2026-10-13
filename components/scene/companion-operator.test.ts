import { describe, expect, test } from "bun:test";

import type {
  OperateEffect,
  OperatorInput,
  OperatorMode,
  OperatorTarget,
  StationView,
} from "./companion-operator";
import {
  consoleClearance,
  engagedHold,
  firstPressDelay,
  operatorPlacement,
  pickStation,
  pressCadence,
  railMode,
  stationAct,
  stepOperator,
  travelDuration,
} from "./companion-operator";

const frame = 1 / 60;
const home = { x: 1100, y: 400 };
const station: OperatorTarget = {
  act: stationAct,
  console: { x: 700, y: 520 },
  controls: [
    { id: "next", label: "Next year" },
    { id: "pull", label: "Pull card 03" },
  ],
  id: "tenure",
};

interface Script {
  canOperate?: boolean;
  isEngaged?: (time: number) => boolean;
  target?: (time: number) => OperatorTarget | null;
}

const run = (
  seconds: number,
  script: Script,
  start: OperatorMode = railMode
) => {
  let mode = start;
  const modes: { kind: OperatorMode["kind"]; time: number }[] = [];
  const effects: (OperateEffect & { time: number })[] = [];
  for (let time = 0; time <= seconds; time += frame) {
    const input: OperatorInput = {
      canOperate: script.canOperate ?? true,
      home,
      isEngaged: script.isEngaged?.(time) ?? false,
      position: operatorPlacement(mode, {
        console: station.console,
        home,
        time,
      }).goal,
      target: script.target ? script.target(time) : station,
      time,
    };
    const { effect, mode: next } = stepOperator(mode, input);
    mode = next;
    if (modes.at(-1)?.kind !== mode.kind) {
      modes.push({ kind: mode.kind, time });
    }
    if (effect) {
      effects.push({ ...effect, time });
    }
  }
  return { effects, mode, modes };
};

describe("companion operator", () => {
  test("a station in view pulls the companion off the rail, it operates each control in turn at a calm pace, then walks back", () => {
    const leaveAt = 20;
    const { effects, modes } = run(24, {
      target: (time) => (time < leaveAt ? station : null),
    });
    expect(modes.map((entry) => entry.kind)).toEqual([
      "travelling",
      "operating",
      "returning",
      "rail",
    ]);
    const arrival = modes[1]?.time ?? 0;
    expect(effects.map((effect) => effect.control.label)).toEqual([
      "Next year",
      "Pull card 03",
      "Next year",
    ]);
    expect(effects[0]?.time).toBeGreaterThan(arrival + firstPressDelay);
    for (let index = 1; index < effects.length; index += 1) {
      const gap = (effects[index]?.time ?? 0) - (effects[index - 1]?.time ?? 0);
      expect(gap).toBeGreaterThanOrEqual(pressCadence);
    }
    expect(modes[2]?.time).toBeCloseTo(leaveAt, 1);
  });

  test("it never presses anything while the reader's pointer is inside the figure, and waits a beat after they leave", () => {
    const engagedUntil = 12;
    const { effects } = run(20, {
      isEngaged: (time) => time > 0.5 && time < engagedUntil,
    });
    expect(effects.length).toBeGreaterThan(0);
    expect(effects[0]?.time).toBeGreaterThanOrEqual(engagedUntil + engagedHold);
  });

  test("a reader reaching in during the wind-up cancels that press instead of fighting them", () => {
    const pressStart = travelDuration(home, station.console) + firstPressDelay;
    const { effects } = run(pressStart + 3, {
      isEngaged: (time) => time > pressStart + 0.1 && time < pressStart + 0.2,
    });
    expect(effects).toEqual([]);
  });

  test("with reduced motion the companion stays on the rail and never operates", () => {
    const { effects, modes } = run(30, { canOperate: false });
    expect(modes.map((entry) => entry.kind)).toEqual(["rail"]);
    expect(effects).toEqual([]);
  });

  test("on a stage the companion performs the stage's action at the stage's size, and shrinks back on the way home", () => {
    const stage: OperatorTarget = {
      act: { action: "type", scale: 2.5, yaw: 0.5 },
      console: { x: 500, y: 600 },
      controls: [],
      id: "build",
    };
    const { effects, mode } = run(6, { target: () => stage });
    expect(effects).toEqual([]);
    expect(mode.kind).toBe("operating");
    const acting = operatorPlacement(mode, {
      console: stage.console,
      home,
      time: 6,
    });
    expect(acting.pose).toMatchObject({ action: "type", yaw: 0.5 });
    expect(acting.scale).toBe(2.5);
    const back: OperatorMode = {
      act: stage.act,
      duration: 1,
      from: stage.console,
      kind: "returning",
      startedAt: 0,
    };
    const context = { console: null, home, time: 0 };
    expect(operatorPlacement(back, context).scale).toBe(2.5);
    expect(operatorPlacement(back, { ...context, time: 1 }).scale).toBe(1);
  });

  test("travel starts where the companion stood and ends exactly on the console", () => {
    const mode: OperatorMode = {
      act: stationAct,
      duration: 1,
      from: home,
      kind: "travelling",
      startedAt: 0,
      stationId: station.id,
    };
    const context = { console: station.console, home, time: 0 };
    expect(operatorPlacement(mode, context).goal).toEqual(home);
    expect(operatorPlacement(mode, { ...context, time: 1 }).goal).toEqual(
      station.console
    );
    const middle = operatorPlacement(mode, { ...context, time: 0.5 });
    expect(middle.pose?.action).toBe("walk");
    expect(middle.pose?.lift).toBeGreaterThan(0);
  });
});

const viewOf = (top: number): StationView => ({
  clearance: consoleClearance,
  console: { bottom: top + 340, left: 600, right: 720, top: top + 280 },
  figure: { bottom: top + 400, left: 368, right: 1072, top },
  id: "stub",
});

describe("station pick", () => {
  const viewport = { height: 900, width: 1440 };

  test("a figure has to be mostly in view to call the companion, but only half out of view to release it", () => {
    expect(pickStation([viewOf(700)], viewport, null, 56)).toBeNull();
    expect(pickStation([viewOf(300)], viewport, null, 56)).toBe("stub");
    expect(pickStation([viewOf(620)], viewport, null, 56)).toBeNull();
    expect(pickStation([viewOf(560)], viewport, "stub", 56)).toBe("stub");
  });

  test("a console scrolled up under the header cannot be stood on", () => {
    expect(pickStation([viewOf(-260)], viewport, "stub", 56)).toBeNull();
  });
});
