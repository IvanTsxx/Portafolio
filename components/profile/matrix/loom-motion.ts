import { DAYS } from "./loom-model";

export interface Axis {
  at: number;
  rate: number;
}

export type Phase = "rest" | "rewind" | "seek" | "sweep";

export const SWEEP_SPEED = 120;
export const SWEEP_ACCEL = 260;
export const TRAVEL_SPEED = 300;
export const TRAVEL_ACCEL = 700;
export const STAGGER = 0.11;

const PIN_STIFFNESS = 320;
const PIN_DAMPING = 22;
const SHARE_STIFFNESS = 64;
const SHARE_DAMPING = 16;
const SETTLED = 5e-3;

export const drive = (
  axis: Axis,
  target: number,
  dt: number,
  speed: number,
  accel: number,
  calm: boolean
) => {
  const gap = target - axis.at;
  if (calm || (Math.abs(gap) < 0.02 && Math.abs(axis.rate) < 1)) {
    axis.at = target;
    axis.rate = 0;
    return false;
  }
  const wanted =
    Math.sign(gap) * Math.min(speed, Math.sqrt(2 * accel * Math.abs(gap)));
  const change = wanted - axis.rate;
  const most = accel * dt;
  axis.rate += Math.max(-most, Math.min(most, change));
  const step = axis.rate * dt;
  axis.at = Math.abs(step) >= Math.abs(gap) ? target : axis.at + step;
  if (axis.at === target) {
    axis.rate = 0;
  }
  return axis.at !== target;
};

export const springTo = (axis: Axis, target: number, dt: number) => {
  const steps = Math.max(Math.ceil(dt * 240), 1);
  const slice = dt / steps;
  for (let step = 0; step < steps; step += 1) {
    axis.rate +=
      (target - axis.at) * SHARE_STIFFNESS * slice -
      axis.rate * SHARE_DAMPING * slice;
    axis.at += axis.rate * slice;
  }
  if (Math.abs(target - axis.at) < 5e-4 && Math.abs(axis.rate) < 5e-4) {
    axis.at = target;
    axis.rate = 0;
  }
};

export const stepPin = (
  heights: Float32Array,
  rates: Float32Array,
  cell: number,
  target: number,
  dt: number,
  calm: boolean
) => {
  let at = heights[cell] ?? 0;
  let rate = rates[cell] ?? 0;
  if (calm) {
    heights[cell] = target;
    rates[cell] = 0;
    return false;
  }
  const steps = Math.max(Math.ceil(dt * 120), 1);
  const slice = dt / steps;
  for (let step = 0; step < steps; step += 1) {
    rate += ((target - at) * PIN_STIFFNESS - rate * PIN_DAMPING) * slice;
    at += rate * slice;
  }
  if (Math.abs(target - at) < SETTLED && Math.abs(rate) < SETTLED * 10) {
    at = target;
    rate = 0;
  }
  heights[cell] = at;
  rates[cell] = rate;
  return at !== target || rate !== 0;
};

export const weekOfCell = (cell: number) => Math.floor(cell / DAYS);

export const weeksPassed = (
  weekX: (week: number) => number,
  weekCount: number,
  x: number
) => {
  let passed = -1;
  for (let week = 0; week < weekCount; week += 1) {
    if (weekX(week) <= x) {
      passed = week;
    }
  }
  return passed;
};

export const runningTotal = (weekTotals: readonly number[], passed: number) => {
  let sum = 0;
  for (let week = 0; week <= passed; week += 1) {
    sum += weekTotals[week] ?? 0;
  }
  return sum;
};
