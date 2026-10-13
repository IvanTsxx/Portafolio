import { ASSEMBLIES } from "./loom-geometry";
import { LIFT, PITCH, translateBy } from "./loom-layout";
import type { LoomLayout } from "./loom-layout";
import { DAYS } from "./loom-model";
import type { LoomYear } from "./loom-model";
import {
  drive,
  runningTotal,
  springTo,
  STAGGER,
  stepPin,
  SWEEP_ACCEL,
  SWEEP_SPEED,
  TRAVEL_ACCEL,
  TRAVEL_SPEED,
  weekOfCell,
  weeksPassed,
} from "./loom-motion";
import type { Axis, Phase } from "./loom-motion";
import { pinPathsOf } from "./loom-pins";
import type { PinField } from "./loom-pins";

const MOST_DT = 1 / 30;
const FOOTPRINT = PITCH * 0.95;
const RAISED = 0.05;

interface PinNodes {
  edge: SVGPathElement | null;
  faceX: SVGPathElement | null;
  faceY: SVGPathElement | null;
  group: SVGGElement;
  top: SVGPathElement | null;
}

interface Loom {
  after: Float32Array;
  before: Float32Array;
  bridge: Axis;
  heights: Float32Array;
  hover: number;
  moving: Set<number>;
  passed: Uint8Array;
  pendingSweep: boolean;
  phase: Phase;
  rates: Float32Array;
  raised: Uint8Array;
  running: number;
  target: number;
  under: Set<number>;
  year: number;
}

export interface LoomSignals {
  onSweep: (year: LoomYear, setSoFar: number) => void;
  onSweepDone: (year: LoomYear) => void;
}

interface Scene {
  bridges: SVGGElement[];
  pins: (PinNodes | null)[];
  root: HTMLElement | null;
}

const pinNodesOf = (svg: SVGSVGElement | null) => {
  const nodes: (PinNodes | null)[] = [];
  for (const group of svg?.querySelectorAll<SVGGElement>("[data-cell]") ?? []) {
    const paths = group.querySelectorAll<SVGPathElement>("path");
    nodes[Number(group.dataset.cell)] = {
      edge: paths[3] ?? null,
      faceX: paths[0] ?? null,
      faceY: paths[1] ?? null,
      group,
      top: paths[2] ?? null,
    };
  }
  return nodes;
};

const placeAssemblies = (
  root: HTMLElement | null,
  layout: LoomLayout,
  shares: readonly Axis[]
) => {
  for (const [index, assembly] of ASSEMBLIES.entries()) {
    const share = shares[index]?.at ?? 1;
    const left = 1 - share;
    for (const group of root?.querySelectorAll<SVGGElement>(
      `[data-part="${assembly.key}"]`
    ) ?? []) {
      if (left === 0) {
        group.removeAttribute("transform");
        group.style.removeProperty("opacity");
      } else {
        group.setAttribute(
          "transform",
          translateBy(layout.axes, [
            assembly.move[0] * left,
            assembly.move[1] * left,
            assembly.move[2] * left,
          ])
        );
        group.style.opacity = `${Math.min(1, share * 2.4)}`;
      }
    }
  }
};

const markAssembled = (root: HTMLElement | null, isAssembled: boolean) => {
  if (!root) {
    return;
  }
  if (isAssembled) {
    root.dataset.assembled = "";
  } else {
    delete root.dataset.assembled;
  }
};

const loomOf = (layout: LoomLayout, year: LoomYear, index: number): Loom => ({
  after: Float32Array.from(year.heights),
  before: Float32Array.from(year.heights),
  bridge: { at: layout.parkLeft, rate: 0 },
  heights: Float32Array.from(year.heights),
  hover: -1,
  moving: new Set(),
  passed: new Uint8Array(layout.weekCount).fill(1),
  pendingSweep: false,
  phase: "rest",
  raised: Uint8Array.from(year.heights, (height) => (height >= RAISED ? 1 : 0)),
  rates: new Float32Array(year.heights.length),
  running: year.total,
  target: layout.parkLeft,
  under: new Set(),
  year: index,
});

const baseTargetOf = (state: Loom, cell: number) => {
  const week = weekOfCell(cell);
  if (state.phase === "sweep" && state.under.has(week)) {
    return 0;
  }
  return (state.passed[week] ? state.after[cell] : state.before[cell]) ?? 0;
};

const targetOf = (state: Loom, cell: number, isReduced: boolean) =>
  baseTargetOf(state, cell) + (cell === state.hover && !isReduced ? LIFT : 0);

const markWeek = (state: Loom, week: number) => {
  for (let day = 0; day < DAYS; day += 1) {
    state.moving.add(week * DAYS + day);
  }
};

const writePin = (
  node: PinNodes | null | undefined,
  field: PinField,
  state: Loom,
  cell: number
) => {
  if (!node) {
    return;
  }
  const height = Math.max(0, state.heights[cell] ?? 0);
  const paths = pinPathsOf(field, cell, height);
  node.faceX?.setAttribute("d", paths.faceX);
  node.faceY?.setAttribute("d", paths.faceY);
  node.top?.setAttribute("d", paths.top);
  node.edge?.setAttribute("d", paths.edge);
  const raised = height >= RAISED ? 1 : 0;
  if (state.raised[cell] !== raised) {
    state.raised[cell] = raised;
    if (node.group.dataset.void === undefined && node.edge) {
      node.edge.dataset.tone = raised ? "hi" : "lo";
    }
  }
};

const underHead = (layout: LoomLayout, x: number) => {
  const under = new Set<number>();
  for (let week = 0; week < layout.weekCount; week += 1) {
    if (Math.abs(layout.weekX(week) - x) < FOOTPRINT) {
      under.add(week);
    }
  }
  return under;
};

export const createLoomEngine = ({
  field,
  initial,
  layout,
  years,
}: {
  field: PinField;
  initial: number;
  layout: LoomLayout;
  years: readonly LoomYear[];
}) => {
  const first = years[initial] ?? years[0];
  const state: Loom | null = first ? loomOf(layout, first, initial) : null;
  const scene: Scene = { bridges: [], pins: [], root: null };
  let signals: LoomSignals | null = null;
  let assembling: { clock: number; shares: Axis[] } | null = null;
  let isRunnable = false;
  let isReduced = false;
  let frame = 0;
  let last = 0;

  const placeBridge = (loom: Loom) => {
    const transform = translateBy(layout.axes, [loom.bridge.at, 0, 0]);
    for (const node of scene.bridges) {
      node.setAttribute("transform", transform);
    }
  };

  const stepAssembly = (dt: number) => {
    if (!assembling) {
      return false;
    }
    assembling.clock += dt;
    for (const [index, share] of assembling.shares.entries()) {
      springTo(share, assembling.clock >= index * STAGGER ? 1 : 0, dt);
    }
    placeAssemblies(scene.root, layout, assembling.shares);
    if (assembling.shares.every((share) => share.at === 1)) {
      assembling = null;
      markAssembled(scene.root, true);
      return false;
    }
    return true;
  };

  const finishLeg = (loom: Loom) => {
    if (loom.phase === "rewind") {
      loom.phase = "sweep";
      loom.target = layout.parkRight;
      return;
    }
    if (loom.phase !== "sweep") {
      loom.phase = "rest";
      return;
    }
    loom.before.set(loom.after);
    for (const week of loom.under) {
      markWeek(loom, week);
    }
    loom.under = new Set();
    loom.phase = "seek";
    loom.target = layout.parkLeft;
    const year = years[loom.year];
    if (year) {
      signals?.onSweepDone(year);
    }
  };

  const stepSweep = (loom: Loom) => {
    const passed = weeksPassed(layout.weekX, layout.weekCount, loom.bridge.at);
    for (let week = 0; week <= passed; week += 1) {
      if (!loom.passed[week]) {
        loom.passed[week] = 1;
        markWeek(loom, week);
      }
    }
    const under = underHead(layout, loom.bridge.at);
    for (const week of new Set([...under, ...loom.under])) {
      markWeek(loom, week);
    }
    loom.under = under;
    const year = years[loom.year];
    const running = year ? runningTotal(year.weekTotals, passed) : 0;
    if (year && running !== loom.running) {
      loom.running = running;
      signals?.onSweep(year, running);
    }
  };

  const stepBridge = (loom: Loom, dt: number) => {
    if (loom.pendingSweep && !assembling) {
      loom.pendingSweep = false;
      loom.phase = "sweep";
      loom.target = layout.parkRight;
    }
    if (loom.phase === "rest") {
      return false;
    }
    const isSweep = loom.phase === "sweep";
    const from = loom.bridge.at;
    const isDriving = drive(
      loom.bridge,
      loom.target,
      dt,
      isSweep ? SWEEP_SPEED : TRAVEL_SPEED,
      isSweep ? SWEEP_ACCEL : TRAVEL_ACCEL,
      isReduced
    );
    if (loom.bridge.at !== from) {
      placeBridge(loom);
    }
    if (isSweep) {
      stepSweep(loom);
    }
    if (!isDriving) {
      finishLeg(loom);
    }
    return true;
  };

  const stepPins = (loom: Loom, dt: number) => {
    for (const cell of loom.moving) {
      const isLive = stepPin(
        loom.heights,
        loom.rates,
        cell,
        targetOf(loom, cell, isReduced),
        dt,
        isReduced
      );
      writePin(scene.pins[cell], field, loom, cell);
      if (!isLive) {
        loom.moving.delete(cell);
      }
    }
    return loom.moving.size > 0;
  };

  const tick = (dt: number) => {
    if (!state) {
      return false;
    }
    const isBuilding = stepAssembly(dt);
    const isTravelling = stepBridge(state, dt);
    const isSettling = stepPins(state, dt);
    return isBuilding || isTravelling || isSettling;
  };

  const step = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, MOST_DT) : 1 / 60;
    last = now;
    frame = tick(dt) ? requestAnimationFrame(step) : 0;
  };

  const start = () => {
    if (!isRunnable || frame) {
      return;
    }
    last = 0;
    frame = requestAnimationFrame(step);
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const settleNow = (loom: Loom) => {
    for (const cell of loom.moving) {
      loom.heights[cell] = targetOf(loom, cell, true);
      loom.rates[cell] = 0;
      writePin(scene.pins[cell], field, loom, cell);
    }
    loom.moving.clear();
  };

  const isInstant = () => isReduced || !isRunnable;

  return {
    hover: (cell: number | null) => {
      const next = cell ?? -1;
      if (!state || state.hover === next) {
        return;
      }
      for (const touched of [state.hover, next]) {
        if (touched >= 0) {
          state.moving.add(touched);
        }
      }
      state.hover = next;
      if (isInstant()) {
        settleNow(state);
      } else {
        start();
      }
    },
    loadYear: (index: number, isReplay: boolean) => {
      const year = years[index];
      if (!(state && year) || (index === state.year && !isReplay)) {
        return;
      }
      for (let cell = 0; cell < state.heights.length; cell += 1) {
        state.before[cell] = baseTargetOf(state, cell);
      }
      state.after.set(year.heights);
      state.year = index;
      state.passed.fill(0);
      state.under = new Set();
      state.running = 0;
      if (isInstant()) {
        state.before.set(year.heights);
        state.passed.fill(1);
        state.running = year.total;
        state.phase = "rest";
        state.bridge = { at: layout.parkLeft, rate: 0 };
        placeBridge(state);
        for (let cell = 0; cell < state.heights.length; cell += 1) {
          state.moving.add(cell);
        }
        settleNow(state);
        signals?.onSweepDone(year);
        return;
      }
      state.pendingSweep = false;
      state.phase =
        state.bridge.at > layout.parkLeft + 0.5 ? "rewind" : "sweep";
      state.target =
        state.phase === "rewind" ? layout.parkLeft : layout.parkRight;
      signals?.onSweep(year, 0);
      start();
    },
    mount: (root: HTMLElement | null, svg: SVGSVGElement | null) => {
      scene.root = root;
      scene.pins = pinNodesOf(svg);
      scene.bridges = [
        ...(svg?.querySelectorAll<SVGGElement>("[data-bridge]") ?? []),
      ];
    },
    prepare: (reduced: boolean) => {
      isReduced = reduced;
      const year = years[initial];
      if (!(state && year) || reduced) {
        markAssembled(scene.root, true);
        return;
      }
      markAssembled(scene.root, false);
      state.heights.fill(0);
      state.before.fill(0);
      state.passed.fill(0);
      state.running = 0;
      state.pendingSweep = true;
      for (const [cell, pin] of scene.pins.entries()) {
        writePin(pin, field, state, cell);
      }
      const shares = ASSEMBLIES.map(() => ({ at: 0, rate: 0 }));
      assembling = { clock: 0, shares };
      placeAssemblies(scene.root, layout, shares);
      signals?.onSweep(year, 0);
      start();
      return () => {
        stop();
        assembling = null;
        placeAssemblies(scene.root, layout, []);
        markAssembled(scene.root, true);
      };
    },
    seek: (week: number | null) => {
      if (!state || state.phase === "sweep" || state.phase === "rewind") {
        return;
      }
      state.target = week === null ? layout.parkLeft : layout.weekX(week);
      if (isInstant()) {
        state.bridge = { at: state.target, rate: 0 };
        state.phase = "rest";
        placeBridge(state);
        return;
      }
      state.phase = "seek";
      start();
    },
    setRunnable: (next: boolean) => {
      isRunnable = next;
      if (next) {
        start();
      } else {
        stop();
      }
    },
    setSignals: (next: LoomSignals | null) => {
      signals = next;
    },
    stop,
  };
};

export type LoomEngine = ReturnType<typeof createLoomEngine>;
