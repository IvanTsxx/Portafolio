import {
  corners,
  cylinder,
  insetPlan,
  iso,
  knurl,
  onTop,
  planOutline,
  ring,
  sideArc,
  sideSeam,
  slabOf,
} from "@/components/iso/iso-kit";
import type { Plan, Point3, Projection } from "@/components/iso/iso-kit";

import {
  BASE_TOP,
  baseOf,
  BEAM_TOP,
  BEAM_Z,
  BED_HALF,
  BED_TOP,
  CARRIAGE_TOP,
  CONSOLE_TOP,
  FINGER_Z,
  HEAD_Z,
  PIN,
  RAIL_TOP,
  RAIL_Y,
} from "./loom-layout";
import type { LoomLayout } from "./loom-layout";
import { DAYS } from "./loom-model";

const BASE_H = 8;
const FOOT_H = 5;
const KEY_UP = 2.6;
const KEY_DOWN = 0.9;

export interface Assembly {
  key: "bridge" | "console" | "rails";
  move: Point3;
}

export const ASSEMBLIES: readonly Assembly[] = [
  { key: "rails", move: [0, 0, 34] },
  { key: "bridge", move: [0, 0, 64] },
  { key: "console", move: [0, 0, 44] },
];

const join = (paths: readonly string[]) => paths.join("");

const byDepth = (P: Projection) => (a: Point3, b: Point3) => {
  const radians = (P.azimuth * Math.PI) / 180;
  const depth = ([x, y]: Point3) =>
    x * Math.cos(radians) + y * Math.sin(radians);
  return depth(a) - depth(b);
};

const baseArt = (L: LoomLayout) => {
  const P = L.projection;
  const base = baseOf(L);
  const z = BASE_TOP;
  const feet = corners(base, 16)
    .map(([x, y]): Point3 => [x, y, 0])
    .toSorted(byDepth(P));
  const screws = corners(base, 7);
  const label: Plan = {
    d: 5,
    r: 1,
    w: 34,
    x: base.x + 10,
    y: base.y + base.d - 8.5,
  };
  return {
    feet: feet.map(([x, y]) => ({
      flange: cylinder(x, y, 7, z - BASE_H - FOOT_H, 1.6, P, 28),
      foot: cylinder(x, y, 5.4, z - BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28),
    })),
    groove: planOutline(insetPlan(base, 4), z, P),
    halo: slabOf(base, z - BASE_H - FOOT_H, BASE_H, P).fill,
    label: slabOf(label, z, 0.8, P, 4),
    labelLine: planOutline(insetPlan(label, 1.2), z + 0.8, P, 4),
    labelRule: join(
      [0, 1].map((row) =>
        onTop(
          [
            [label.x + 6, label.y + 1.9 + row * 1.3],
            [label.x + (row ? 22 : 28), label.y + 1.9 + row * 1.3],
          ],
          z + 0.8,
          P
        )
      )
    ),
    labelScrews: [label.x + 2.6, label.x + label.w - 2.6].map((x) =>
      iso([x, label.y + label.d / 2, z + 0.8], P)
    ),
    screwRings: join(screws.map(([x, y]) => ring(x, y, 2.2, z, P, 16))),
    screws: screws.map(([x, y]) => iso([x, y, z], P)),
    seam: sideSeam(base, z - BASE_H / 2, P),
    slab: slabOf(base, z - BASE_H, BASE_H, P, 8, 1.2),
  };
};

const railPlan = (L: LoomLayout, side: -1 | 1): Plan => ({
  d: 6,
  r: 1,
  w: L.railRight - L.railLeft,
  x: L.railLeft,
  y: side * RAIL_Y - 3,
});

const railArt = (L: LoomLayout, side: -1 | 1) => {
  const P = L.projection;
  const rail = railPlan(L, side);
  const y = side * RAIL_Y;
  const stops = [rail.x + 1, rail.x + rail.w - 5].map((x) =>
    slabOf({ d: 8, r: 1, w: 4, x, y: y - 4 }, RAIL_TOP, 4, P, 3, 0.4)
  );
  const stopScrews = [rail.x + 3, rail.x + rail.w - 3].map((x) =>
    iso([x, y, RAIL_TOP + 4], P)
  );
  const teeth: string[] = [];
  const screws = [];
  if (side < 0) {
    for (let x = rail.x + 8; x <= rail.x + rail.w - 8; x += 2.5) {
      teeth.push(
        onTop(
          [
            [x, rail.y],
            [x, rail.y + rail.d],
          ],
          RAIL_TOP,
          P
        )
      );
    }
  } else {
    for (let x = rail.x + 14; x < rail.x + rail.w - 10; x += 26) {
      screws.push(iso([x, y, RAIL_TOP], P));
    }
  }
  return {
    rail: slabOf(rail, BASE_TOP, RAIL_TOP - BASE_TOP, P, 3, 0.4),
    screws,
    stopScrews,
    stops,
    teeth: join(teeth),
  };
};

const driveArt = (L: LoomLayout) => {
  const P = L.projection;
  const block: Plan = {
    d: 18,
    r: 2,
    w: 16,
    x: L.railLeft - 18,
    y: -RAIL_Y - 9,
  };
  const top = BASE_TOP + 14;
  const cx = block.x + block.w / 2;
  const cy = block.y + block.d / 2;
  const wheelTop = top + 2.6;
  const crankX = cx + 3.4;
  return {
    block: slabOf(block, BASE_TOP, top - BASE_TOP, P, 4, 0.6),
    blockScrews: corners(block, 2.4).map(([x, y]) => iso([x, y, top], P)),
    blockSeam: sideSeam(block, BASE_TOP + 5, P, 4),
    crank: cylinder(crankX, cy, 0.8, wheelTop, 4.4, P, 14),
    crankKnob: cylinder(crankX, cy, 1.4, wheelTop + 4.4, 1.6, P, 16),
    wheel: cylinder(cx, cy, 5.6, top, 2.6, P, 36),
    wheelHub: ring(cx, cy, 1.6, wheelTop, P, 16),
    wheelKnurl: knurl(cx, cy, 5.6, [top, wheelTop], 40, P),
  };
};

const bedArt = (L: LoomLayout) => {
  const P = L.projection;
  const bed: Plan = {
    d: BED_HALF * 2,
    r: 3,
    w: L.bedRight - L.bedLeft,
    x: L.bedLeft,
    y: -BED_HALF,
  };
  const first = L.weekX(0);
  const last = L.weekX(L.weekCount - 1);
  const field: Plan = {
    d: L.dayY(DAYS - 1) - L.dayY(0) + PIN + 4,
    r: 1.4,
    w: last - first + PIN + 4,
    x: first - PIN / 2 - 2,
    y: L.dayY(0) - PIN / 2 - 2,
  };
  const strip: Plan = {
    d: 3.8,
    r: 0.6,
    w: last - first + 6,
    x: first - 3,
    y: L.dayY(DAYS - 1) + PIN / 2 + 3.2,
  };
  const stripTop = BED_TOP + 0.6;
  const minor: string[] = [];
  const major: string[] = [];
  for (let week = 0; week < L.weekCount; week += 1) {
    const isMajor = week % 13 === 0 || week === L.weekCount - 1;
    const x = L.weekX(week);
    (isMajor ? major : minor).push(
      onTop(
        [
          [x, strip.y + 0.2],
          [x, strip.y + (isMajor ? 2.9 : 1.5)],
        ],
        stripTop,
        P
      )
    );
  }
  const detentX = first - PIN / 2 - 11;
  const detents = Array.from({ length: DAYS }, (_, day) => L.dayY(day));
  const screws = [
    [bed.x + 5, bed.y + 5],
    [bed.x + 5, bed.y + bed.d - 5],
    [bed.x + bed.w - 4.5, bed.y + 4.5],
    [bed.x + bed.w - 4.5, bed.y + bed.d - 4.5],
  ] as const;
  return {
    detentDots: detents.map((y) => iso([detentX, y, BED_TOP], P)),
    detentRings: join(
      detents.map((y) => ring(detentX, y, 1.7, BED_TOP, P, 18))
    ),
    detentTrack: planOutline(
      {
        d: L.dayY(DAYS - 1) - L.dayY(0) + 6,
        r: 3,
        w: 6,
        x: detentX - 3,
        y: L.dayY(0) - 3,
      },
      BED_TOP,
      P,
      6
    ),
    field: planOutline(field, BED_TOP, P, 3),
    screwRings: join(screws.map(([x, y]) => ring(x, y, 1.6, BED_TOP, P, 14))),
    screws: screws.map(([x, y]) => iso([x, y, BED_TOP], P)),
    seam: sideSeam(bed, BASE_TOP + 4, P),
    slab: slabOf(bed, BASE_TOP, BED_TOP - BASE_TOP, P, 8, 1),
    strip: slabOf(strip, BED_TOP, 0.6, P, 3),
    ticksMajor: join(major),
    ticksMinor: join(minor),
  };
};

const carriageOf = (P: Projection, side: -1 | 1) => {
  const y = side * RAIL_Y;
  const plan: Plan = { d: 10, r: 1.5, w: 16, x: -8, y: y - 5 };
  return {
    carriage: slabOf(plan, RAIL_TOP, CARRIAGE_TOP - RAIL_TOP, P, 4, 0.5),
    carriageScrews: corners(plan, 2).map(([x, py]) =>
      iso([x, py, CARRIAGE_TOP], P)
    ),
  };
};

const legOf = (L: LoomLayout, side: -1 | 1) => {
  const P = L.projection;
  const beamZ = BEAM_Z + L.bridgeRise;
  const leg: Plan = { d: 4, r: 1, w: 4, x: -2, y: side * RAIL_Y - 2 };
  return {
    leg: slabOf(leg, CARRIAGE_TOP, beamZ - CARRIAGE_TOP, P, 3, 0.4),
    legSeams: join(
      [CARRIAGE_TOP + 6, beamZ - 6].map((z) => sideSeam(leg, z, P, 3))
    ),
  };
};

const bridgeBackArt = (L: LoomLayout) => {
  const P = L.projection;
  const knobX = 5;
  const knobY = -RAIL_Y;
  return {
    ...carriageOf(P, -1),
    ...legOf(L, -1),
    knob: cylinder(knobX, knobY, 2.2, CARRIAGE_TOP, 2.6, P, 22),
    knobKnurl: knurl(
      knobX,
      knobY,
      2.2,
      [CARRIAGE_TOP, CARRIAGE_TOP + 2.6],
      22,
      P
    ),
  };
};

const bridgeFrontArt = (L: LoomLayout) => {
  const P = L.projection;
  const rise = L.bridgeRise;
  const beamZ = BEAM_Z + rise;
  const beamTop = BEAM_TOP + rise;
  const headZ = HEAD_Z + rise;
  const fingerZ = FINGER_Z + rise;
  const head: Plan = {
    d: L.dayY(DAYS - 1) - L.dayY(0) + 10,
    r: 1.2,
    w: 6,
    x: -3,
    y: L.dayY(0) - 5,
  };
  const beam: Plan = { d: 100, r: 1.5, w: 8, x: -4, y: -50 };
  const lamp: Plan = { d: 7, r: 1.2, w: 4.4, x: -2.2, y: -3.5 };
  const rowMarks = join(
    Array.from({ length: DAYS }, (_, day) =>
      onTop(
        [
          [beam.x, L.dayY(day)],
          [beam.x + beam.w, L.dayY(day)],
        ],
        beamTop,
        P
      )
    ).filter((_, day) => Math.abs(L.dayY(day)) > lamp.d / 2 + 0.4)
  );
  return {
    ...carriageOf(P, 1),
    ...legOf(L, 1),
    beam: slabOf(beam, beamZ, beamTop - beamZ, P, 3, 0.6),
    beamCapScrews: [-47, 47].map((y) => iso([0, y, beamTop + 1.8], P)),
    beamCaps: [-1, 1].map((side) =>
      slabOf(
        { d: 4, r: 0.8, w: 8, x: -4, y: side > 0 ? 45 : -49 },
        beamTop,
        1.8,
        P,
        3,
        0.3
      )
    ),
    fingers: Array.from({ length: DAYS }, (_, day) =>
      slabOf(
        { d: 2.4, r: 0.6, w: 2.4, x: -1.2, y: L.dayY(day) - 1.2 },
        fingerZ,
        headZ - fingerZ,
        P,
        2
      )
    ),
    head: slabOf(head, headZ, beamZ - headZ, P, 3, 0.4),
    headSeam: sideSeam(head, headZ + 2, P, 3),
    lamp: slabOf(lamp, beamTop, 1.6, P, 3, 0.3),
    rowMarks,
  };
};

const consoleArt = (L: LoomLayout, years: readonly number[]) => {
  const P = L.projection;
  const box = L.console;
  const top = CONSOLE_TOP;
  const pitch = (box.w - 12) / Math.max(1, years.length);
  const keyWidth = pitch - 1.8;
  const keys = years.map((year, index) => {
    const plan: Plan = {
      d: 10,
      r: 1,
      w: keyWidth,
      x: box.x + 6 + index * pitch + 0.9,
      y: 4,
    };
    return {
      bezel: planOutline(
        {
          d: plan.d + 1.2,
          r: 1.4,
          w: plan.w + 1.2,
          x: plan.x - 0.6,
          y: plan.y - 0.6,
        },
        top,
        P,
        3
      ),
      down: slabOf(plan, top, KEY_DOWN, P, 3, 0.3),
      up: slabOf(plan, top, KEY_UP, P, 3, 0.3),
      year,
    };
  });
  const sweep = { r: 4.2, x: box.x + 11, y: -9 };
  const busiest = { r: 3, x: box.x + 23, y: -9 };
  const vents = Array.from({ length: 4 }, (_, row) =>
    planOutline(
      { d: 1.4, r: 0.7, w: 14, x: box.x + 31, y: -17 + row * 3.2 },
      top,
      P,
      3
    )
  );
  return {
    box: slabOf(box, BASE_TOP, top - BASE_TOP, P, 6, 0.8),
    boxSeam: sideSeam(box, BASE_TOP + 4, P, 6),
    busiest: cylinder(busiest.x, busiest.y, busiest.r, top, 1.8, P, 28),
    busiestBezel: ring(busiest.x, busiest.y, busiest.r + 1, top, P, 28),
    busiestRing: ring(busiest.x, busiest.y, busiest.r - 1.1, top + 1.8, P, 24),
    keys,
    panel: planOutline(insetPlan(box, 3), top, P, 6),
    screws: corners(box, 1.7).map(([x, y]) => iso([x, y, top], P)),
    sweep: cylinder(sweep.x, sweep.y, sweep.r, top, 2.2, P, 32),
    sweepBezel: ring(sweep.x, sweep.y, sweep.r + 1.1, top, P, 32),
    sweepRing: ring(sweep.x, sweep.y, sweep.r - 1.4, top + 2.2, P, 28),
    sweepSeam: sideArc(sweep.x, sweep.y, sweep.r, top + 1, P, 20),
    vents: join(vents),
  };
};

export const loomArtOf = (L: LoomLayout, years: readonly number[]) => ({
  base: baseArt(L),
  bed: bedArt(L),
  bridgeBack: bridgeBackArt(L),
  bridgeFront: bridgeFrontArt(L),
  console: consoleArt(L, years),
  drive: driveArt(L),
  railBack: railArt(L, -1),
  railFront: railArt(L, 1),
});

export type LoomArt = ReturnType<typeof loomArtOf>;
