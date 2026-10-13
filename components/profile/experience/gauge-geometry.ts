import {
  axisVector,
  corners,
  cylinder,
  fitProjection,
  insetPlan,
  iso,
  knurl,
  onTop,
  planOutline,
  ring,
  segment,
  sideArc,
  sideSeam,
  slabOf,
} from "@/components/iso/iso-kit";
import type { Flat, Plan, Point3, Projection } from "@/components/iso/iso-kit";

import type { Career, Tenure } from "./career";

export const GAUGE_WIDTH = 600;
export const GAUGE_HEIGHT = 272;

const AZIMUTH = 74;
const MONTH = 6;
const LANE_GAP = 16;
const BLOCK_DEPTH = 10;
const BLOCK_BASE = 6;
const BLOCK_RISE = 5;
const PLATE_DEPTH = 36;
const PLATE_H = 12;
const BASE_H = 10;
const FOOT_H = 5;
const RAIL_Y = 46;
const RAIL_TOP = -PLATE_H + 4;
const BEAM_Z = 46;
const BEAM_TOP = BEAM_Z + 8;
const SADDLE_TOP = BEAM_TOP + 4;
const HOUSING: Plan = { d: 12, r: 1.5, w: 10, x: 6.5, y: -6 };
const HOUSING_Z = 42;
const HOUSING_TOP = 72;
const RAM_X = HOUSING.x + HOUSING.w / 2;
const RAM_LENGTH = 26;
const HEAD_H = 5;
const STYLUS_LOW = 30.4;
const BALL_R = 1.4;
const TIP_Z = STYLUS_LOW - BALL_R * 2 + 0.4;
const LIFT = 3;
const SCAN_INSET = 3;

export interface Assembly {
  key: string;
  move: Point3;
}

export interface GaugeStop {
  end: number;
  lane: number;
  reach: number;
  start: number;
}

export interface GaugeRig {
  assemblies: readonly Assembly[];
  axes: { x: Flat; y: Flat; z: Flat };
  lift: number;
  stops: readonly GaugeStop[];
}

export interface Ball {
  center: Flat;
  radius: number;
}

const laneOf = (step: number, count: number) =>
  ((count - 1) / 2 - step) * LANE_GAP;

const heightOf = (step: number) => BLOCK_BASE + step * BLOCK_RISE;

const join = (paths: readonly string[]) => paths.join("");

const fine = (value: number) => Math.round(value * 100) / 100;

export const translateBy = (axes: GaugeRig["axes"], [x, y, z]: Point3) =>
  `translate(${fine(axes.x[0] * x + axes.y[0] * y + axes.z[0] * z)} ${fine(
    axes.x[1] * x + axes.y[1] * y + axes.z[1] * z
  )})`;

export const restPose = (stop: GaugeStop) => ({
  bx: stop.end - SCAN_INSET,
  cy: stop.lane,
  ext: stop.reach,
});

const layoutOf = (career: Career) => {
  const span = career.months * MONTH;
  const left = -span / 2;
  const right = span / 2;
  const plate: Plan = {
    d: PLATE_DEPTH * 2,
    r: 3,
    w: span + 24,
    x: left - 12,
    y: -PLATE_DEPTH,
  };
  const base: Plan = {
    d: 116,
    r: 6,
    w: span + 40 + 64,
    x: left - 40,
    y: -58,
  };
  return { base, left, plate, right, span };
};

const fitOf = (career: Career): Projection => {
  const { base, left, right } = layoutOf(career);
  const points: Point3[] = [];
  for (const [x, y] of corners(base)) {
    points.push([x, y, -PLATE_H - BASE_H - FOOT_H]);
  }
  for (const x of [left + SCAN_INSET - RAM_X, right - SCAN_INSET - RAM_X]) {
    for (const y of [-24, 24]) {
      points.push(
        [x + HOUSING.x + HOUSING.w, y + HOUSING.y, HOUSING_TOP + 1.5],
        [x - 6.5, y - 9, SADDLE_TOP]
      );
    }
  }
  return fitProjection(points, GAUGE_WIDTH, GAUGE_HEIGHT, {
    azimuth: AZIMUTH,
    pad: 14,
  });
};

const stopOf = (tenure: Tenure, count: number, left: number): GaugeStop => ({
  end: left + tenure.endMonth * MONTH - RAM_X,
  lane: laneOf(tenure.step, count),
  reach: TIP_Z - heightOf(tenure.step),
  start: left + tenure.startMonth * MONTH - RAM_X,
});

const baseArt = (career: Career, P: Projection) => {
  const { base, left } = layoutOf(career);
  const z = -PLATE_H;
  const feet = corners(base, 18).toSorted(
    (a, b) => a[0] * 0.45 + a[1] - (b[0] * 0.45 + b[1])
  );
  const label: Plan = { d: 5, r: 1, w: 46, x: left - 26, y: 51.5 };
  const screws = corners(base, 7);
  const handleXs = [base.x + 5, base.x + base.w - 5];
  return {
    feet: feet.map(([x, y]) => [
      cylinder(x, y, 7, z - BASE_H - FOOT_H, 1.6, P, 28),
      cylinder(x, y, 5.4, z - BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28),
    ]),
    groove: planOutline(insetPlan(base, 4), z, P),
    halo: slabOf(base, z - BASE_H - FOOT_H, BASE_H, P).fill,
    handleBars: handleXs.map((x) =>
      slabOf(
        { d: 22.4, r: 1, w: 2.4, x: x - 1.2, y: -11.2 },
        z + 5,
        1.8,
        P,
        3,
        0.3
      )
    ),
    handlePosts: handleXs.flatMap((x) =>
      [-10, 10].map((y) => cylinder(x, y, 1.1, z, 5, P, 14))
    ),
    label: slabOf(label, z, 0.8, P, 4),
    labelLine: planOutline(insetPlan(label, 1.2), z + 0.8, P, 4),
    labelRule: join(
      [0, 1].map((row) =>
        onTop(
          [
            [label.x + 6, label.y + 1.9 + row * 1.4],
            [label.x + (row ? 28 : 38), label.y + 1.9 + row * 1.4],
          ],
          z + 0.8,
          P
        )
      )
    ),
    labelScrews: [
      iso([label.x + 2.6, label.y + label.d / 2, z + 0.8], P),
      iso([label.x + label.w - 2.6, label.y + label.d / 2, z + 0.8], P),
    ],
    screwRings: join(screws.map(([x, y]) => ring(x, y, 2.2, z, P, 16))),
    screws: screws.map(([x, y]) => iso([x, y, z], P)),
    seam: sideSeam(base, z - BASE_H / 2, P),
    slab: slabOf(base, z - BASE_H, BASE_H, P, 8, 1.2),
  };
};

const railArt = (career: Career, P: Projection, side: -1 | 1) => {
  const { left, span } = layoutOf(career);
  const y = side * RAIL_Y;
  const rail: Plan = { d: 8, r: 1.2, w: span + 54, x: left - 32, y: y - 4 };
  const stops = [rail.x + 1, rail.x + rail.w - 5].map((x) =>
    slabOf({ d: 10, r: 1, w: 4, x, y: y - 5 }, RAIL_TOP, 4, P, 3, 0.4)
  );
  const screws: Flat[] = [];
  for (let x = rail.x + 12; x < rail.x + rail.w - 8; x += 24) {
    screws.push(iso([x, y, RAIL_TOP], P));
  }
  const clamps: Plan[] = [];
  for (let x = left + 30; x < rail.x + rail.w - 12; x += 48) {
    clamps.push({ d: 4, r: 0.8, w: 6, x: x - 3, y: side > 0 ? y + 4 : y - 8 });
  }
  return {
    clampScrews: clamps.map((clamp) =>
      iso([clamp.x + 3, clamp.y + 2, -PLATE_H + 2.4], P)
    ),
    clamps: clamps.map((clamp) => slabOf(clamp, -PLATE_H, 2.4, P, 2, 0.3)),
    rail: slabOf(rail, -PLATE_H, 4, P, 3, 0.4),
    screws,
    stops,
  };
};

const bearingArt = (P: Projection, side: -1 | 1) => {
  const y = side * RAIL_Y;
  const bearing: Plan = { d: 12, r: 2, w: 18, x: -9, y: y - 6 };
  const leg: Plan = { d: 8, r: 1.2, w: 9, x: -4.5, y: y - 4 };
  const lockKnob = (x: number) => cylinder(x, y, 1.4, RAIL_TOP + 6, 1.8, P, 18);
  const lockKnurl = (x: number) =>
    knurl(x, y, 1.4, [RAIL_TOP + 6, RAIL_TOP + 7.8], 14, P);
  return {
    bearing: slabOf(bearing, RAIL_TOP, 6, P, 4, 0.5),
    leg: slabOf(leg, RAIL_TOP + 6, BEAM_Z - RAIL_TOP - 6, P, 3, 0.5),
    legSeams: join(
      [RAIL_TOP + 14, BEAM_Z - 8].map((z) => sideSeam(leg, z, P, 3))
    ),
    lockBack: lockKnob(-6.8),
    lockBackKnurl: lockKnurl(-6.8),
    lockFront: lockKnob(6.8),
    lockFrontKnurl: lockKnurl(6.8),
    reader:
      side > 0
        ? slabOf(
            { d: 2, r: 0.5, w: 6, x: -3, y: y + 6 },
            RAIL_TOP + 0.6,
            4,
            P,
            2,
            0.3
          )
        : null,
  };
};

const laneTicks = (P: Projection, count: number) => {
  const minor: string[] = [];
  const major: string[] = [];
  const face = 5.5;
  const reach = ((count - 1) / 2) * LANE_GAP + 4;
  for (let y = -reach; y <= reach + 1e-6; y += 4) {
    const big = Math.abs((y - laneOf(0, count)) % LANE_GAP) < 1e-6;
    (big ? major : minor).push(
      segment([face, y, BEAM_TOP], [face, y, BEAM_TOP - (big ? 3.4 : 1.8)], P)
    );
  }
  return { major: join(major), minor: join(minor) };
};

const beamArt = (P: Projection, count: number) => {
  const beam: Plan = { d: 104, r: 1.5, w: 11, x: -5.5, y: -52 };
  const ticks = laneTicks(P, count);
  return {
    beam: slabOf(beam, BEAM_Z, 8, P, 3, 0.8),
    capScrews: [-48, 48].map((y) => iso([0, y, BEAM_TOP + 2.4], P)),
    caps: [-1, 1].map((side) =>
      slabOf(
        { d: 4, r: 0.8, w: 11, x: -5.5, y: side > 0 ? 46 : -50 },
        BEAM_TOP,
        2.4,
        P,
        3,
        0.4
      )
    ),
    ticksMajor: ticks.major,
    ticksMinor: ticks.minor,
  };
};

const plateArt = (career: Career, P: Projection) => {
  const { left, plate, span } = layoutOf(career);
  const count = career.tenures.length;
  const strip: Plan = { d: 4.6, r: 0.6, w: span + 4, x: left - 2, y: 30.6 };
  const edge = strip.y + 0.3;
  const minor: string[] = [];
  const major: string[] = [];
  for (let month = 0; month <= career.months; month += 1) {
    const x = left + month * MONTH;
    const big = month % 12 === 0;
    const quarter = month % 3 === 0 ? 2.4 : 1.5;
    (big ? major : minor).push(
      onTop(
        [
          [x, edge],
          [x, edge + (big ? 3.4 : quarter)],
        ],
        0.6,
        P
      )
    );
  }
  const inserts = corners(plate, 6);
  const lanes = career.tenures.map((tenure) =>
    onTop(
      [
        [plate.x, laneOf(tenure.step, count)],
        [plate.x + plate.w, laneOf(tenure.step, count)],
      ],
      0,
      P
    )
  );
  const fence: Plan = { d: 60, r: 0.8, w: 3.5, x: left - 3.5, y: -30 };
  return {
    fence: slabOf(fence, 0, 4, P, 2, 0.4),
    fenceClampScrews: [-20, 20].map((y) => iso([left - 5.75, y, 2.2], P)),
    fenceClamps: [-20, 20].map((y) =>
      slabOf({ d: 6, r: 0.8, w: 4.5, x: left - 8, y: y - 3 }, 0, 2.2, P, 2, 0.3)
    ),
    fenceScrews: [-22, 0, 22].map((y) => iso([fence.x + fence.w / 2, y, 4], P)),
    groove: planOutline(insetPlan(plate, 3), 0, P),
    insertDots: inserts.map(([x, y]) => iso([x, y, 0], P)),
    insertRings: join(inserts.map(([x, y]) => ring(x, y, 1.6, 0, P, 16))),
    lanes: join(lanes),
    seam: sideSeam(plate, -PLATE_H / 2, P),
    slab: slabOf(plate, -PLATE_H, PLATE_H, P, 6, 1.4),
    strip: slabOf(strip, 0, 0.6, P, 3),
    stripStops: [strip.x - 1.6, strip.x + strip.w].map((x) =>
      slabOf(
        { d: strip.d + 0.4, r: 0.4, w: 1.6, x, y: strip.y - 0.2 },
        0,
        1.4,
        P,
        2
      )
    ),
    ticksMajor: join(major),
    ticksMinor: join(minor),
    zero: onTop(
      [
        [left, edge],
        [left, strip.y + strip.d - 0.3],
      ],
      0.6,
      P
    ),
  };
};

const nowArt = (career: Career, P: Projection) => {
  const { left } = layoutOf(career);
  const current = career.tenures.find((tenure) => tenure.isCurrent);
  if (!current) {
    return null;
  }
  const x = left + current.endMonth * MONTH;
  return {
    rider: slabOf(
      { d: 5.8, r: 0.5, w: 2.4, x: x - 1.2, y: 30 },
      0.6,
      1.2,
      P,
      2
    ),
    tick: onTop(
      [
        [x, 30.3],
        [x, 35.5],
      ],
      1.8,
      P
    ),
  };
};

const blockArt = (tenure: Tenure, career: Career, P: Projection) => {
  const { left } = layoutOf(career);
  const count = career.tenures.length;
  const lane = laneOf(tenure.step, count);
  const height = heightOf(tenure.step);
  const plan: Plan = {
    d: BLOCK_DEPTH,
    r: 0.6,
    w: tenure.months * MONTH,
    x: left + tenure.startMonth * MONTH,
    y: lane - BLOCK_DEPTH / 2,
  };
  const engraveLength = Math.min(14, plan.w - 8);
  return {
    engraving: join(
      [0, 1].map((row) =>
        onTop(
          [
            [plan.x + 3, lane + 1.4 + row * 1.6],
            [
              plan.x + 3 + engraveLength * (row ? 0.6 : 1),
              lane + 1.4 + row * 1.6,
            ],
          ],
          height,
          P
        )
      )
    ),
    halo: slabOf(insetPlan(plan, 1), 0, 0.1, P).fill,
    slab: slabOf(plan, 0, height, P, 2, 0.5),
  };
};

const carriageArt = (P: Projection) => {
  const saddle: Plan = { d: 18, r: 2, w: 13, x: -6.5, y: -9 };
  const cap: Plan = insetPlan(HOUSING, 1.4);
  return {
    balancer: cylinder(12, 8.6, 1.8, HOUSING_Z + 4, 22, P, 20),
    balancerBands: join(
      [HOUSING_Z + 7, HOUSING_Z + 23].map((z) => sideArc(12, 8.6, 1.8, z, P))
    ),
    brackets: [HOUSING_Z + 6, HOUSING_Z + 22].map((z) =>
      slabOf({ d: 1.4, r: 0.3, w: 3, x: 10.5, y: 6 }, z, 2, P, 2)
    ),
    cap: slabOf(cap, HOUSING_TOP, 1.5, P, 3, 0.3),
    capScrews: [
      iso([cap.x + 1.8, cap.y + 1.8, HOUSING_TOP + 1.5], P),
      iso([cap.x + cap.w - 1.8, cap.y + cap.d - 1.8, HOUSING_TOP + 1.5], P),
    ],
    housing: slabOf(HOUSING, HOUSING_Z, HOUSING_TOP - HOUSING_Z, P, 3, 0.6),
    housingSeams: join(
      [HOUSING_Z + 6, HOUSING_TOP - 8].map((z) => sideSeam(HOUSING, z, P, 3))
    ),
    knob: cylinder(-1.5, 4.5, 2.4, SADDLE_TOP, 3, P, 24),
    knobKnurl: knurl(-1.5, 4.5, 2.4, [SADDLE_TOP, SADDLE_TOP + 3], 20, P),
    knobPointer: onTop(
      [
        [-1.5, 4.5],
        [-1.5, 6.4],
      ],
      SADDLE_TOP + 3,
      P
    ),
    reader: slabOf(
      { d: 3, r: 0.5, w: 4, x: -5.5, y: -7.5 },
      SADDLE_TOP,
      1.2,
      P,
      2
    ),
    saddle: slabOf(saddle, BEAM_TOP, 4, P, 4, 0.6),
    saddleScrews: [
      iso([saddle.x + 2.4, saddle.y + 2.4, SADDLE_TOP], P),
      iso([saddle.x + 2.4, saddle.y + saddle.d - 2.4, SADDLE_TOP], P),
      iso([saddle.x + saddle.w - 2.4, saddle.y + 2.4, SADDLE_TOP], P),
    ],
  };
};

const ramArt = (P: Projection) => {
  const ram: Plan = { d: 5, r: 0.8, w: 5, x: RAM_X - 2.5, y: -2.5 };
  const headLow = HOUSING_Z - HEAD_H;
  const ballZ = TIP_Z + BALL_R;
  const ball = iso([RAM_X, 0, ballZ], P);
  const k = Math.abs(axisVector(P, [0, 0, 1])[1]) / Math.cos(Math.PI / 6);
  return {
    ball: { center: ball, radius: BALL_R * k } satisfies Ball,
    ballShine: iso([RAM_X - 0.4, -0.5, ballZ + 0.5], P),
    head: cylinder(RAM_X, 0, 2.6, headLow, HEAD_H, P, 28),
    headSeam: sideArc(RAM_X, 0, 2.6, headLow + 1.6, P),
    module: cylinder(RAM_X, 0, 1.5, headLow - 1.6, 1.6, P, 16),
    ram: slabOf(ram, HOUSING_Z, RAM_LENGTH, P, 2, 0.3),
    stylus: cylinder(RAM_X, 0, 0.7, STYLUS_LOW, headLow - STYLUS_LOW, P, 14),
  };
};

const consoleArt = (career: Career, P: Projection) => {
  const { right } = layoutOf(career);
  const z = -PLATE_H;
  const box: Plan = { d: 34, r: 2.5, w: 26, x: right + 30, y: 4 };
  const top = z + 8;
  const knobs: Flat[] = [
    [box.x + 7, box.y + 9],
    [box.x + 7, box.y + 21],
  ];
  const stick: Flat = [box.x + 17.5, box.y + 22];
  const rack: Flat = [right + 36, -26];
  return {
    box: slabOf(box, z, 8, P, 4, 0.8),
    estop: [
      cylinder(box.x + 17.5, box.y + 9, 2.6, top, 1, P, 24),
      cylinder(box.x + 17.5, box.y + 9, 2.2, top + 1, 1.8, P, 24),
    ],
    knobKnurls: join(
      knobs.map(([x, y]) => knurl(x, y, 2.6, [top, top + 2.6], 22, P))
    ),
    knobPointers: join(
      knobs.map(([x, y], index) =>
        onTop(
          [
            [x, y],
            [x + (index ? -1.4 : 1.6), y + (index ? 1.8 : 1.2)],
          ],
          top + 2.6,
          P
        )
      )
    ),
    knobs: knobs.map(([x, y]) => cylinder(x, y, 2.6, top, 2.6, P, 24)),
    panel: planOutline(insetPlan(box, 2.4), top, P, 4),
    rack: [
      cylinder(rack[0], rack[1], 3.2, z, 0.8, P, 24),
      cylinder(rack[0], rack[1], 0.9, z + 0.8, 9, P, 14),
      cylinder(rack[0], rack[1], 2.4, z + 9.8, 1.4, P, 24),
      cylinder(rack[0], rack[1], 0.7, z + 11.2, 5, P, 12),
      cylinder(rack[0], rack[1], 1.4, z + 16.2, 1.4, P, 16),
    ],
    screws: corners(box, 1.6).map(([x, y]) => iso([x, y, top], P)),
    stickBase: cylinder(stick[0], stick[1], 4, top, 1.4, P, 28),
    stickBoot: ring(stick[0], stick[1], 2.6, top + 1.4, P, 24),
    stickKnob: cylinder(stick[0], stick[1], 2, top + 8.4, 2.4, P, 20),
    stickShaft: cylinder(stick[0], stick[1], 0.9, top + 1.4, 7, P, 14),
  };
};

export const gaugeOf = (career: Career, selected: number) => {
  const P = fitOf(career);
  const { left } = layoutOf(career);
  const count = career.tenures.length;
  const stops = career.tenures.map((tenure) => stopOf(tenure, count, left));
  const rig: GaugeRig = {
    assemblies: [
      { key: "rails", move: [0, 0, 24] },
      { key: "plate", move: [0, 0, 36] },
      ...career.tenures.map((tenure): Assembly => ({
        key: `block-${tenure.step}`,
        move: [0, 0, 28 + tenure.step * 6],
      })),
      { key: "bridge", move: [0, 0, 48] },
      { key: "carriage", move: [0, 0, 64] },
      { key: "console", move: [28, 0, 0] },
    ],
    axes: {
      x: axisVector(P, [1, 0, 0]),
      y: axisVector(P, [0, 1, 0]),
      z: axisVector(P, [0, 0, 1]),
    },
    lift: LIFT,
    stops,
  };
  const rest = stops[selected] ?? stops.at(-1);
  return {
    art: {
      base: baseArt(career, P),
      beam: beamArt(P, count),
      bearingBack: bearingArt(P, -1),
      bearingFront: bearingArt(P, 1),
      blocks: career.tenures.map((tenure) => blockArt(tenure, career, P)),
      carriage: carriageArt(P),
      console: consoleArt(career, P),
      now: nowArt(career, P),
      plate: plateArt(career, P),
      railBack: railArt(career, P, -1),
      railFront: railArt(career, P, 1),
      ram: ramArt(P),
    },
    rest: rest ? restPose(rest) : { bx: 0, cy: 0, ext: LIFT },
    rig,
  };
};

export type GaugeArt = ReturnType<typeof gaugeOf>["art"];
