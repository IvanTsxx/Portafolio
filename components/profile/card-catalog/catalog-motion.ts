import type { Point3 } from "@/components/iso/iso-kit";

import type { CardRoute } from "./catalog-geometry";

export interface Axis {
  at: number;
  rate: number;
}

export type ReadPhase = "going" | "seated" | "returning" | "home";

export interface Read {
  held: number;
  phase: ReadPhase;
  slot: number;
  u: number;
}

export const SEATED_AT = 4;
export const HOLD_SECONDS = 1.3;
export const STAGGER = 0.09;
const SEGMENT_SECONDS = [0.18, 0.3, 0.16, 0.2] as const;
const STIFFNESS = 64;
const DAMPING = 15;

const ease = (t: number) => {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
};

const mix = (from: number, to: number, share: number) =>
  from + (to - from) * share;

export const poseAt = (
  route: CardRoute,
  u: number,
  hoverShare: number
): Point3 => {
  const resting = hoverShare * route.hover;
  const rise = ease(u);
  const slide = ease(u - 1);
  const shift = ease(u - 2);
  const drop = ease(u - 3);
  const dz =
    u <= 1
      ? mix(resting, route.carry, rise)
      : mix(route.carry, route.drop, drop);
  return [route.shift * shift, route.slide * slide, dz];
};

export const liftPose = (route: CardRoute, hoverShare: number): Point3 => [
  0,
  0,
  hoverShare * route.hover,
];

export const startRead = (slot: number): Read => ({
  held: 0,
  phase: "going",
  slot,
  u: 0,
});

const segmentOf = (u: number, isRising: boolean) => {
  const index = isRising ? Math.floor(u) : Math.ceil(u) - 1;
  return Math.min(SEGMENT_SECONDS.length - 1, Math.max(0, index));
};

export type ReadEvent = "seated" | "done" | null;

export const stepRead = (read: Read, dt: number, calm: boolean): ReadEvent => {
  if (read.phase === "home") {
    return null;
  }
  if (read.phase === "seated") {
    read.held += dt;
    if (read.held >= HOLD_SECONDS) {
      read.phase = "returning";
    }
    return null;
  }
  const isRising = read.phase === "going";
  if (calm) {
    read.u = isRising ? SEATED_AT : 0;
  } else {
    let left = dt;
    while (left > 0) {
      const segment = segmentOf(read.u, isRising);
      const seconds = SEGMENT_SECONDS[segment] ?? 0.2;
      const edge = isRising ? segment + 1 : segment;
      const room = Math.abs(edge - read.u) * seconds;
      const used = Math.min(left, room);
      read.u += ((isRising ? 1 : -1) * used) / seconds;
      left -= used;
      if (used === room) {
        read.u = edge;
        if (edge === SEATED_AT || edge === 0) {
          break;
        }
      }
    }
  }
  if (isRising && read.u >= SEATED_AT) {
    read.u = SEATED_AT;
    read.phase = "seated";
    read.held = 0;
    return "seated";
  }
  if (!isRising && read.u <= 0) {
    read.u = 0;
    read.phase = "home";
    return "done";
  }
  return null;
};

export const settle = (
  axis: Axis,
  target: number,
  dt: number,
  seconds: number,
  calm: boolean
) => {
  if (calm) {
    axis.at = target;
    axis.rate = 0;
    return false;
  }
  const w = 1 / seconds;
  const slice = dt / 4;
  for (let step = 0; step < 4; step += 1) {
    axis.rate += (w * w * (target - axis.at) - 2 * w * axis.rate) * slice;
    axis.at += axis.rate * slice;
  }
  if (Math.abs(target - axis.at) < 1e-3 && Math.abs(axis.rate) < 1e-2) {
    axis.at = target;
    axis.rate = 0;
  }
  return axis.at !== target;
};

export const springTo = (
  axis: Axis,
  target: number,
  dt: number,
  calm: boolean
) => {
  if (calm) {
    axis.at = target;
    axis.rate = 0;
    return false;
  }
  const steps = Math.max(Math.ceil(dt * 240), 1);
  const slice = dt / steps;
  for (let step = 0; step < steps; step += 1) {
    axis.rate +=
      (target - axis.at) * STIFFNESS * slice - axis.rate * DAMPING * slice;
    axis.at += axis.rate * slice;
  }
  if (Math.abs(target - axis.at) < 5e-4 && Math.abs(axis.rate) < 5e-4) {
    axis.at = target;
    axis.rate = 0;
  }
  return axis.at !== target;
};
