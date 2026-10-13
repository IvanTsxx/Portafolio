import type { GaugeStop } from "./gauge-geometry";

export type Phase = "lift" | "travel" | "touch" | "scan" | "rest";

export interface Axis {
  at: number;
  rate: number;
}

export interface Mechanism {
  bx: Axis;
  cy: Axis;
  ext: Axis;
  phase: Phase;
  stop: GaugeStop;
}

export const SCAN_INSET = 3;
export const STAGGER = 0.11;
const STIFFNESS = 64;
const DAMPING = 16;

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
    return;
  }
  const w = 1 / seconds;
  const slice = dt / 4;
  for (let step = 0; step < 4; step += 1) {
    axis.rate += (w * w * (target - axis.at) - 2 * w * axis.rate) * slice;
    axis.at += axis.rate * slice;
  }
  if (Math.abs(target - axis.at) < 0.02 && Math.abs(axis.rate) < 0.05) {
    axis.at = target;
    axis.rate = 0;
  }
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
    return;
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
};

const near = (axis: Axis, target: number, by: number) =>
  Math.abs(axis.at - target) < by;

export const scanStartOf = (stop: GaugeStop) => stop.start + SCAN_INSET;

export const scanEndOf = (stop: GaugeStop) => stop.end - SCAN_INSET;

const phaseSteps: Record<
  Exclude<Phase, "rest">,
  (mech: Mechanism, lift: number, dt: number, calm: boolean) => Phase
> = {
  lift: (mech, lift, dt, calm) => {
    settle(mech.ext, lift, dt, 0.09, calm);
    return near(mech.ext, lift, 0.6) ? "travel" : "lift";
  },
  scan: (mech, _lift, dt, calm) => {
    const { stop } = mech;
    settle(mech.cy, stop.lane, dt, 0.2, calm);
    settle(mech.ext, stop.reach, dt, 0.1, calm);
    settle(mech.bx, scanEndOf(stop), dt, 0.32, calm);
    const isDone =
      mech.bx.at === scanEndOf(stop) &&
      mech.cy.at === stop.lane &&
      mech.ext.at === stop.reach;
    return isDone ? "rest" : "scan";
  },
  touch: (mech, _lift, dt, calm) => {
    const { stop } = mech;
    settle(mech.bx, scanStartOf(stop), dt, 0.22, calm);
    settle(mech.cy, stop.lane, dt, 0.2, calm);
    settle(mech.ext, stop.reach, dt, 0.1, calm);
    return near(mech.ext, stop.reach, 0.25) ? "scan" : "touch";
  },
  travel: (mech, lift, dt, calm) => {
    const { stop } = mech;
    settle(mech.ext, lift, dt, 0.09, calm);
    settle(mech.bx, scanStartOf(stop), dt, 0.22, calm);
    settle(mech.cy, stop.lane, dt, 0.2, calm);
    const isThere =
      near(mech.bx, scanStartOf(stop), 0.8) && near(mech.cy, stop.lane, 0.5);
    return isThere ? "touch" : "travel";
  },
};

export const stepMechanism = (
  mech: Mechanism,
  lift: number,
  dt: number,
  calm: boolean
) => {
  for (let pass = 0; pass < 4 && mech.phase !== "rest"; pass += 1) {
    const before = mech.phase;
    mech.phase = phaseSteps[before](mech, lift, dt, calm);
    if (!calm || mech.phase === before) {
      break;
    }
  }
  return mech.phase !== "rest";
};

export const restOf = (stop: GaugeStop): Mechanism => ({
  bx: { at: scanEndOf(stop), rate: 0 },
  cy: { at: stop.lane, rate: 0 },
  ext: { at: stop.reach, rate: 0 },
  phase: "rest",
  stop,
});

export const aimAt = (mech: Mechanism, stop: GaugeStop) => {
  if (mech.stop === stop) {
    return false;
  }
  mech.stop = stop;
  mech.phase = "lift";
  return true;
};
