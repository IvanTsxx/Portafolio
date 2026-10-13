import type { FigureControl } from "@/components/iso/figure-stations";
import type { AgentAction } from "@/lib/agents/roles";

import type { ScreenRect, Viewport } from "./companion-placement";
import { castPresence } from "./companion-placement";

export interface Point {
  x: number;
  y: number;
}

export interface StageAct {
  action: AgentAction;
  scale: number;
  yaw: number;
}

interface Press {
  isImpacted: boolean;
  startedAt: number;
}

export type OperatorMode =
  | { kind: "rail" }
  | {
      act: StageAct;
      duration: number;
      from: Point;
      kind: "travelling";
      startedAt: number;
      stationId: string;
    }
  | {
      act: StageAct;
      controlIndex: number;
      kind: "operating";
      nextPressAt: number;
      press: Press | null;
      stationId: string;
    }
  | {
      act: StageAct;
      duration: number;
      from: Point;
      kind: "returning";
      startedAt: number;
    };

export interface OperatorTarget {
  act: StageAct;
  console: Point;
  controls: readonly FigureControl[];
  id: string;
}

export interface OperatorInput {
  canOperate: boolean;
  home: Point;
  isEngaged: boolean;
  position: Point;
  target: OperatorTarget | null;
  time: number;
}

export interface OperateEffect {
  control: FigureControl;
  stationId: string;
}

export interface OperatorStep {
  effect: OperateEffect | null;
  mode: OperatorMode;
}

export interface OperatorPose {
  action: AgentAction;
  lean: number;
  lift: number;
  squash: number;
  yaw: number;
}

export interface OperatorPlacement {
  goal: Point;
  pose: OperatorPose | null;
  scale: number;
}

export const firstPressDelay = 1.6;
export const pressSeconds = 0.9;
export const pressImpact = 0.38;
export const pressCadence = 5.5;
export const engagedHold = 3.5;
const travelSpeed = 900;
const travelMin = 0.6;
const travelMax = 1.2;
const travelArc = 28;
const travelHops = 3;
const travelHop = 6;
const travelYaw = 1.1;
export const consoleYaw = -0.12;
const enterPresence = 0.7;
const leavePresence = 0.45;

export const stationAct: StageAct = {
  action: "inspect",
  scale: 1,
  yaw: consoleYaw,
};

export const railMode: OperatorMode = { kind: "rail" };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

const lerp = (from: number, to: number, share: number) =>
  from + (to - from) * share;

const lerpPoint = (from: Point, to: Point, share: number): Point => ({
  x: lerp(from.x, to.x, share),
  y: lerp(from.y, to.y, share),
});

export const travelDuration = (from: Point, to: Point) =>
  Math.min(
    travelMax,
    Math.max(travelMin, Math.hypot(to.x - from.x, to.y - from.y) / travelSpeed)
  );

const travelTo = (
  position: Point,
  target: OperatorTarget,
  time: number
): OperatorMode => ({
  act: target.act,
  duration: travelDuration(position, target.console),
  from: position,
  kind: "travelling",
  startedAt: time,
  stationId: target.id,
});

const returnHome = (input: OperatorInput, act: StageAct): OperatorMode => ({
  act,
  duration: travelDuration(input.position, input.home),
  from: input.position,
  kind: "returning",
  startedAt: input.time,
});

const idle = (mode: OperatorMode): OperatorStep => ({ effect: null, mode });

const stepOperating = (
  current: Extract<OperatorMode, { kind: "operating" }>,
  { isEngaged, target, time }: OperatorInput & { target: OperatorTarget }
): OperatorStep => {
  const mode =
    current.act === target.act ? current : { ...current, act: target.act };
  const { press } = mode;
  if (!press) {
    if (isEngaged) {
      return idle({
        ...mode,
        nextPressAt: Math.max(mode.nextPressAt, time + engagedHold),
      });
    }
    if (time >= mode.nextPressAt && target.controls.length > 0) {
      return idle({ ...mode, press: { isImpacted: false, startedAt: time } });
    }
    return idle(mode);
  }
  const progress = (time - press.startedAt) / pressSeconds;
  if (!press.isImpacted && isEngaged) {
    return idle({ ...mode, nextPressAt: time + engagedHold, press: null });
  }
  if (!press.isImpacted && progress >= pressImpact) {
    const control =
      target.controls[mode.controlIndex % target.controls.length] ?? null;
    return {
      effect: control ? { control, stationId: target.id } : null,
      mode: { ...mode, press: { ...press, isImpacted: true } },
    };
  }
  if (progress >= 1) {
    return idle({
      ...mode,
      controlIndex: mode.controlIndex + 1,
      nextPressAt: time + pressCadence,
      press: null,
    });
  }
  return idle(mode);
};

export const stepOperator = (
  mode: OperatorMode,
  input: OperatorInput
): OperatorStep => {
  const target = input.canOperate ? input.target : null;
  switch (mode.kind) {
    case "rail": {
      return idle(target ? travelTo(input.position, target, input.time) : mode);
    }
    case "travelling": {
      if (!target) {
        return idle(returnHome(input, mode.act));
      }
      if (target.id !== mode.stationId) {
        return idle(travelTo(input.position, target, input.time));
      }
      if (input.time - mode.startedAt < mode.duration) {
        return idle(
          mode.act === target.act ? mode : { ...mode, act: target.act }
        );
      }
      return idle({
        act: target.act,
        controlIndex: 0,
        kind: "operating",
        nextPressAt: input.time + firstPressDelay,
        press: null,
        stationId: mode.stationId,
      });
    }
    case "operating": {
      if (!target || target.id !== mode.stationId) {
        return idle(returnHome(input, mode.act));
      }
      return stepOperating(mode, { ...input, target });
    }
    case "returning": {
      if (target) {
        return idle(travelTo(input.position, target, input.time));
      }
      return idle(
        input.time - mode.startedAt < mode.duration ? mode : railMode
      );
    }
    default: {
      return idle(mode);
    }
  }
};

const travelPose = (
  progress: number,
  from: Point,
  to: Point
): OperatorPose => ({
  action: "walk",
  lean: 0,
  lift:
    Math.sin(progress * Math.PI) * travelArc +
    Math.abs(Math.sin(progress * Math.PI * travelHops)) * travelHop,
  squash: 1,
  yaw: to.x < from.x ? -travelYaw : travelYaw,
});

export const pressPose = (progress: number, yaw = consoleYaw): OperatorPose => {
  if (progress < pressImpact) {
    const windup = Math.sin((progress / pressImpact) * Math.PI * 0.5);
    return {
      action: "point",
      lean: -0.06 * windup,
      lift: 6 * windup,
      squash: 1 + 0.06 * windup,
      yaw,
    };
  }
  const release = (progress - pressImpact) / (1 - pressImpact);
  const settle = 1 - easeInOutCubic(clamp01(release));
  return {
    action: "point",
    lean: 0.14 * settle,
    lift: -3 * settle,
    squash: 1 - 0.14 * settle,
    yaw,
  };
};

const actingPose = (act: StageAct): OperatorPose => ({
  action: act.action,
  lean: 0,
  lift: 0,
  squash: 1,
  yaw: act.yaw,
});

export const operatorPlacement = (
  mode: OperatorMode,
  { console, home, time }: { console: Point | null; home: Point; time: number }
): OperatorPlacement => {
  switch (mode.kind) {
    case "travelling": {
      const destination = console ?? home;
      const progress = clamp01((time - mode.startedAt) / mode.duration);
      const share = easeInOutCubic(progress);
      return {
        goal: lerpPoint(mode.from, destination, share),
        pose: travelPose(progress, mode.from, destination),
        scale: lerp(1, mode.act.scale, share),
      };
    }
    case "operating": {
      const press = mode.press
        ? clamp01((time - mode.press.startedAt) / pressSeconds)
        : null;
      return {
        goal: console ?? home,
        pose:
          press === null
            ? actingPose(mode.act)
            : pressPose(press, mode.act.yaw),
        scale: mode.act.scale,
      };
    }
    case "returning": {
      const progress = clamp01((time - mode.startedAt) / mode.duration);
      const share = easeInOutCubic(progress);
      return {
        goal: lerpPoint(mode.from, home, share),
        pose: travelPose(progress, mode.from, home),
        scale: lerp(mode.act.scale, 1, share),
      };
    }
    default: {
      return { goal: home, pose: null, scale: 1 };
    }
  }
};

export interface StationView {
  clearance: number;
  console: ScreenRect;
  figure: ScreenRect;
  id: string;
}

export const consoleClearance = 72;

const consoleReachable = (
  { clearance, console }: StationView,
  viewport: Viewport,
  headerClearance: number
) =>
  console.top - clearance >= headerClearance &&
  console.bottom <= viewport.height &&
  console.left >= 0 &&
  console.right <= viewport.width;

export const pickStation = (
  stations: readonly StationView[],
  viewport: Viewport,
  currentId: string | null,
  headerClearance: number
): string | null => {
  const current = stations.find((station) => station.id === currentId);
  if (
    current &&
    castPresence(current.figure, viewport) >= leavePresence &&
    consoleReachable(current, viewport, headerClearance)
  ) {
    return current.id;
  }
  let best: { id: string; presence: number } | null = null;
  for (const station of stations) {
    const presence = castPresence(station.figure, viewport);
    if (
      presence >= enterPresence &&
      consoleReachable(station, viewport, headerClearance) &&
      presence > (best?.presence ?? 0)
    ) {
      best = { id: station.id, presence };
    }
  }
  return best?.id ?? null;
};
