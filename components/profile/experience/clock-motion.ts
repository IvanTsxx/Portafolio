import {
  CARD_W,
  CARD_Y,
  CLOCK_X,
  HELD_BOTTOM,
  HOVER_LIFT,
  LEVER_PULLED,
  LEVER_REST,
  LIP_TOP,
  SHELF_TOP,
  SLOT_CARD_Y,
  TRAVEL_BOTTOM,
} from "./clock-layout";

export type FlightPhase =
  | "rise"
  | "travel"
  | "drop"
  | "stamp"
  | "held"
  | "lift"
  | "back"
  | "lower";

export interface Axis {
  at: number;
  rate: number;
}

export interface Flight {
  age: number;
  dx: Axis;
  dy: Axis;
  dz: Axis;
  job: number;
  phase: FlightPhase;
}

export interface Desk {
  flight: Flight | null;
  hover: Axis[];
  hovered: number | null;
  homes: readonly number[];
  pending: number | null;
}

export const STAMP_SECONDS = 0.46;
export const STAGGER = 0.11;
const RISE_Z = TRAVEL_BOTTOM - SHELF_TOP;
const HELD_Z = HELD_BOTTOM - SHELF_TOP;
const SLOT_DY = SLOT_CARD_Y - CARD_Y;
const CLEAR_Z = LIP_TOP - SHELF_TOP + 0.5;
const STIFFNESS = 64;
const DAMPING = 16;

const outbound = new Set<FlightPhase>([
  "rise",
  "travel",
  "drop",
  "stamp",
  "held",
]);

export const isOutbound = (phase: FlightPhase) => outbound.has(phase);

const still = (at = 0): Axis => ({ at, rate: 0 });

export const deskOf = (homes: readonly number[]): Desk => ({
  flight: null,
  homes,
  hover: homes.map(() => still()),
  hovered: null,
  pending: null,
});

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

const slotDx = (desk: Desk, job: number) =>
  CLOCK_X - CARD_W / 2 - (desk.homes[job] ?? 0);

const near = (axis: Axis, target: number, by = 0.4) =>
  Math.abs(axis.at - target) < by;

export const feed = (desk: Desk, job: number) => {
  const { flight } = desk;
  if (!flight) {
    desk.flight = {
      age: 0,
      dx: still(),
      dy: still(),
      dz: still(desk.hover[job]?.at ?? 0),
      job,
      phase: "rise",
    };
    desk.pending = null;
    return;
  }
  if (flight.job === job) {
    desk.pending = null;
    if (!isOutbound(flight.phase)) {
      flight.phase = flight.phase === "lower" ? "rise" : "travel";
    }
    return;
  }
  desk.pending = job;
  if (isOutbound(flight.phase)) {
    flight.phase = flight.phase === "rise" ? "lower" : "lift";
  }
};

export const release = (desk: Desk) => {
  desk.pending = null;
  const { flight } = desk;
  if (flight && isOutbound(flight.phase)) {
    flight.phase = flight.phase === "rise" ? "lower" : "lift";
  }
};

type Step = (
  flight: Flight,
  desk: Desk,
  dt: number,
  calm: boolean
) => FlightPhase;

const snap = (axis: Axis, target: number) => {
  axis.at = target;
  axis.rate = 0;
};

const steps: Record<FlightPhase, Step> = {
  back: (flight, _desk, dt, calm) => {
    settle(flight.dx, 0, dt, 0.18, calm);
    settle(flight.dy, 0, dt, 0.16, calm);
    settle(flight.dz, RISE_Z, dt, 0.1, calm);
    return near(flight.dx, 0, 1.5) && near(flight.dy, 0, 1) ? "lower" : "back";
  },
  drop: (flight, desk, dt, calm) => {
    settle(flight.dx, slotDx(desk, flight.job), dt, 0.1, calm);
    settle(flight.dy, SLOT_DY, dt, 0.1, calm);
    settle(flight.dz, HELD_Z, dt, 0.1, calm);
    if (near(flight.dz, HELD_Z, 0.06)) {
      snap(flight.dx, slotDx(desk, flight.job));
      snap(flight.dy, SLOT_DY);
      snap(flight.dz, HELD_Z);
      flight.age = 0;
      return "stamp";
    }
    return "drop";
  },
  held: () => "held",
  lift: (flight, _desk, dt, calm) => {
    settle(flight.dz, RISE_Z, dt, 0.1, calm);
    return near(flight.dz, RISE_Z, 5) ? "back" : "lift";
  },
  lower: (flight, _desk, dt, calm) => {
    settle(flight.dx, 0, dt, 0.08, calm);
    settle(flight.dy, 0, dt, 0.08, calm);
    settle(flight.dz, 0, dt, 0.1, calm);
    if (near(flight.dz, 0, 0.05) && near(flight.dx, 0, 0.05)) {
      snap(flight.dx, 0);
      snap(flight.dy, 0);
      snap(flight.dz, 0);
    }
    return "lower";
  },
  rise: (flight, _desk, dt, calm) => {
    settle(flight.dz, RISE_Z, dt, 0.1, calm);
    return near(flight.dz, RISE_Z, 6) ? "travel" : "rise";
  },
  stamp: (flight, _desk, dt, calm) => {
    flight.age += dt;
    return calm || flight.age >= STAMP_SECONDS ? "held" : "stamp";
  },
  travel: (flight, desk, dt, calm) => {
    const dx = slotDx(desk, flight.job);
    settle(flight.dz, RISE_Z, dt, 0.1, calm);
    settle(flight.dx, dx, dt, 0.18, calm);
    settle(flight.dy, SLOT_DY, dt, 0.16, calm);
    return near(flight.dx, dx, 1.5) && near(flight.dy, SLOT_DY, 1)
      ? "drop"
      : "travel";
  },
};

const isHome = (flight: Flight) =>
  flight.phase === "lower" &&
  flight.dz.at === 0 &&
  flight.dx.at === 0 &&
  flight.dy.at === 0;

export const stepDesk = (desk: Desk, dt: number, calm: boolean) => {
  let isMoving = false;
  for (const [job, axis] of desk.hover.entries()) {
    const isLifted = desk.hovered === job && desk.flight?.job !== job;
    springTo(axis, isLifted ? HOVER_LIFT : 0, dt, calm);
    if (axis.rate !== 0 || axis.at !== (isLifted ? HOVER_LIFT : 0)) {
      isMoving = true;
    }
  }
  for (let pass = 0; pass < 8 && desk.flight; pass += 1) {
    const flight: Flight = desk.flight;
    const before = flight.phase;
    flight.phase = steps[before](flight, desk, dt, calm);
    if (isHome(flight)) {
      if (desk.hover[flight.job]) {
        desk.hover[flight.job] = still();
      }
      desk.flight = null;
      const next = desk.pending;
      if (next !== null) {
        feed(desk, next);
        continue;
      }
      break;
    }
    if (!calm || flight.phase === before) {
      break;
    }
  }
  if (desk.flight && desk.flight.phase !== "held") {
    isMoving = true;
  }
  return isMoving;
};

export const isAirborne = (flight: Flight | null) =>
  Boolean(
    flight &&
    (flight.dz.at > CLEAR_Z ||
      Math.abs(flight.dx.at) > 0.01 ||
      Math.abs(flight.dy.at) > 0.01)
  );

export const leverAngle = (flight: Flight | null) => {
  if (!flight || flight.phase !== "stamp") {
    return LEVER_REST;
  }
  const share = Math.min(1, flight.age / STAMP_SECONDS);
  const pull = Math.sin(Math.PI * share) ** 2;
  return LEVER_REST + (LEVER_PULLED - LEVER_REST) * pull;
};

export const joltOf = (flight: Flight | null) => {
  if (!flight || flight.phase !== "stamp") {
    return 0;
  }
  const share = Math.min(1, flight.age / STAMP_SECONDS);
  return -0.9 * Math.sin(Math.PI * share) ** 4;
};
