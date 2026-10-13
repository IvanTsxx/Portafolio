import type { FigureControl } from "@/components/iso/figure-stations";
import type { AgentAction } from "@/lib/agents/roles";

import type { ScreenRect, Viewport } from "./companion-placement";
import { castPresence } from "./companion-placement";

export interface Point {
  x: number;
  y: number;
}

interface Press {
  isImpacted: boolean;
  startedAt: number;
}

export type OperatorMode =
  | { kind: "rail" }
  | { kind: "yielding" }
  | {
      duration: number;
      from: Point;
      kind: "travelling";
      startedAt: number;
      stationId: string;
    }
  | {
      controlIndex: number;
      kind: "operating";
      nextPressAt: number;
      press: Press | null;
      stationId: string;
    }
  | { duration: number; from: Point; kind: "returning"; startedAt: number };

export interface OperatorTarget {
  console: Point;
  controls: readonly FigureControl[];
  id: string;
}

export interface OperatorInput {
  canOperate: boolean;
  home: Point;
  isEngaged: boolean;
  isYielding: boolean;
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
  stationShare: number;
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
const consoleYaw = -0.12;
const enterPresence = 0.7;
const leavePresence = 0.45;

export const railMode: OperatorMode = { kind: "rail" };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

const lerpPoint = (from: Point, to: Point, share: number): Point => ({
  x: from.x + (to.x - from.x) * share,
  y: from.y + (to.y - from.y) * share,
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
  duration: travelDuration(position, target.console),
  from: position,
  kind: "travelling",
  startedAt: time,
  stationId: target.id,
});

const returnHome = (input: OperatorInput): OperatorMode => ({
  duration: travelDuration(input.position, input.home),
  from: input.position,
  kind: "returning",
  startedAt: input.time,
});

const idle = (mode: OperatorMode): OperatorStep => ({ effect: null, mode });

const stepOperating = (
  mode: Extract<OperatorMode, { kind: "operating" }>,
  { isEngaged, target, time }: OperatorInput & { target: OperatorTarget }
): OperatorStep => {
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
  if (input.isYielding) {
    return idle(mode.kind === "yielding" ? mode : { kind: "yielding" });
  }
  const current = mode.kind === "yielding" ? railMode : mode;
  const target = input.canOperate ? input.target : null;
  switch (current.kind) {
    case "rail": {
      return idle(
        target ? travelTo(input.position, target, input.time) : current
      );
    }
    case "travelling": {
      if (!target) {
        return idle(returnHome(input));
      }
      if (target.id !== current.stationId) {
        return idle(travelTo(input.position, target, input.time));
      }
      if (input.time - current.startedAt < current.duration) {
        return idle(current);
      }
      return idle({
        controlIndex: 0,
        kind: "operating",
        nextPressAt: input.time + firstPressDelay,
        press: null,
        stationId: current.stationId,
      });
    }
    case "operating": {
      if (!target || target.id !== current.stationId) {
        return idle(returnHome(input));
      }
      return stepOperating(current, { ...input, target });
    }
    case "returning": {
      if (target) {
        return idle(travelTo(input.position, target, input.time));
      }
      return idle(
        input.time - current.startedAt < current.duration ? current : railMode
      );
    }
    default: {
      return idle(current);
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

export const pressPose = (progress: number): OperatorPose => {
  if (progress < pressImpact) {
    const windup = Math.sin((progress / pressImpact) * Math.PI * 0.5);
    return {
      action: "point",
      lean: -0.06 * windup,
      lift: 6 * windup,
      squash: 1 + 0.06 * windup,
      yaw: consoleYaw,
    };
  }
  const release = (progress - pressImpact) / (1 - pressImpact);
  const settle = 1 - easeInOutCubic(clamp01(release));
  return {
    action: "point",
    lean: 0.14 * settle,
    lift: -3 * settle,
    squash: 1 - 0.14 * settle,
    yaw: consoleYaw,
  };
};

const waitingPose: OperatorPose = {
  action: "inspect",
  lean: 0,
  lift: 0,
  squash: 1,
  yaw: consoleYaw,
};

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
        stationShare: share,
      };
    }
    case "operating": {
      const press = mode.press
        ? clamp01((time - mode.press.startedAt) / pressSeconds)
        : null;
      return {
        goal: console ?? home,
        pose: press === null ? waitingPose : pressPose(press),
        stationShare: 1,
      };
    }
    case "returning": {
      const progress = clamp01((time - mode.startedAt) / mode.duration);
      const share = easeInOutCubic(progress);
      return {
        goal: lerpPoint(mode.from, home, share),
        pose: travelPose(progress, mode.from, home),
        stationShare: 1 - share,
      };
    }
    default: {
      return { goal: home, pose: null, stationShare: 0 };
    }
  }
};

export interface StationView {
  console: ScreenRect;
  figure: ScreenRect;
  id: string;
}

export const consoleClearance = 72;

const consoleReachable = (
  rect: ScreenRect,
  viewport: Viewport,
  headerClearance: number
) =>
  rect.top - consoleClearance >= headerClearance &&
  rect.bottom <= viewport.height &&
  rect.left >= 0 &&
  rect.right <= viewport.width;

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
    consoleReachable(current.console, viewport, headerClearance)
  ) {
    return current.id;
  }
  let best: { id: string; presence: number } | null = null;
  for (const station of stations) {
    const presence = castPresence(station.figure, viewport);
    if (
      presence >= enterPresence &&
      consoleReachable(station.console, viewport, headerClearance) &&
      presence > (best?.presence ?? 0)
    ) {
      best = { id: station.id, presence };
    }
  }
  return best?.id ?? null;
};
