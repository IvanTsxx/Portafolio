import { axisVector, fitProjection, iso } from "@/components/iso/iso-kit";
import type { Flat, Point3, Projection } from "@/components/iso/iso-kit";

import { DAYS } from "./loom-model";

export const LOOM_WIDTH = 640;
export const LOOM_HEIGHT = 262;

export const AZIMUTH = 66;
export const PITCH = 8;
export const PIN = 5;
export const LIFT = 3.4;

export const BASE_TOP = -8;
export const BED_TOP = 0;
export const BED_HALF = 34;
export const RAIL_Y = 44;
export const RAIL_TOP = BASE_TOP + 5;
export const CARRIAGE_TOP = RAIL_TOP + 5;
export const BEAM_Z = 38;
export const BEAM_TOP = BEAM_Z + 6;
export const HEAD_Z = 30;
export const FINGER_Z = HEAD_Z - 3.5;
export const CONSOLE_TOP = 10;
export const PARK_GAP = 16;
export const LEFT_MARGIN = 20;
export const RIGHT_MARGIN = 10;

export interface LoomLayout {
  axes: { x: Flat; y: Flat; z: Flat };
  bedLeft: number;
  bridgeRise: number;
  bedRight: number;
  console: { d: number; r: number; w: number; x: number; y: number };
  parkLeft: number;
  parkRight: number;
  projection: Projection;
  railLeft: number;
  railRight: number;
  weekCount: number;
  weekX: (week: number) => number;
  dayY: (day: number) => number;
}

export const dayYOf = (day: number) => (day - (DAYS - 1) / 2) * PITCH;

const spanOf = (weekCount: number) => {
  const weekX = (week: number) => (week - (weekCount - 1) / 2) * PITCH;
  const first = weekX(0);
  const last = weekX(weekCount - 1);
  const parkLeft = first - PARK_GAP;
  const parkRight = last + PARK_GAP;
  const railLeft = parkLeft - 14;
  const railRight = parkRight + 14;
  return {
    bedLeft: first - PIN / 2 - LEFT_MARGIN,
    bedRight: last + PIN / 2 + RIGHT_MARGIN,
    console: { d: 46, r: 3, w: 50, x: railRight + 14, y: -23 },
    parkLeft,
    parkRight,
    railLeft,
    railRight,
    weekX,
  };
};

export const baseOf = (span: ReturnType<typeof spanOf>) => ({
  d: 116,
  r: 6,
  w: span.console.x + span.console.w + 10 - (span.railLeft - 26),
  x: span.railLeft - 26,
  y: -60,
});

export const loomLayoutOf = (
  weekCount: number,
  tallest: number
): LoomLayout => {
  const span = spanOf(weekCount);
  const bridgeRise = Math.max(0, tallest + LIFT + 3 - FINGER_Z);
  const base = baseOf(span);
  const points: Point3[] = [
    [base.x, base.y, BASE_TOP - 14],
    [base.x + base.w, base.y, BASE_TOP - 14],
    [base.x, base.y + base.d, BASE_TOP - 14],
    [base.x + base.w, base.y + base.d, BASE_TOP - 14],
    [span.parkLeft - 5, -52, BEAM_TOP + bridgeRise + 2],
    [span.parkLeft + 5, 52, BEAM_TOP + bridgeRise + 2],
    [span.parkRight + 5, -52, BEAM_TOP + bridgeRise + 2],
    [span.railLeft - 14, -52, 14],
    [span.console.x + span.console.w, span.console.y, CONSOLE_TOP + 4],
  ];
  const projection = fitProjection(points, LOOM_WIDTH, LOOM_HEIGHT, {
    azimuth: AZIMUTH,
    pad: 10,
  });
  return {
    ...span,
    axes: {
      x: axisVector(projection, [1, 0, 0]),
      y: axisVector(projection, [0, 1, 0]),
      z: axisVector(projection, [0, 0, 1]),
    },
    bridgeRise,
    dayY: dayYOf,
    projection,
    weekCount,
  };
};

const fine = (value: number) => Math.round(value * 100) / 100;

export const translateBy = (axes: LoomLayout["axes"], [x, y, z]: Point3) =>
  `translate(${fine(axes.x[0] * x + axes.y[0] * y + axes.z[0] * z)} ${fine(
    axes.x[1] * x + axes.y[1] * y + axes.z[1] * z
  )})`;

export const pinCornersOf = (layout: LoomLayout, week: number, day: number) => {
  const cx = layout.weekX(week);
  const cy = layout.dayY(day);
  const half = PIN / 2;
  return (
    [
      [cx - half, cy - half],
      [cx + half, cy - half],
      [cx + half, cy + half],
      [cx - half, cy + half],
    ] as const
  ).map(([x, y]) => iso([x, y, BED_TOP], layout.projection));
};

export const cellAtPoint = (
  layout: LoomLayout,
  [px, py]: Flat
): { day: number; week: number } | null => {
  const { axes, projection } = layout;
  const origin = iso([0, 0, BED_TOP], projection);
  const u = px - origin[0];
  const v = py - origin[1];
  const det = axes.x[0] * axes.y[1] - axes.y[0] * axes.x[1];
  const x = (u * axes.y[1] - v * axes.y[0]) / det;
  const y = (v * axes.x[0] - u * axes.x[1]) / det;
  const week = Math.round(x / PITCH + (layout.weekCount - 1) / 2);
  const day = Math.round(y / PITCH + (DAYS - 1) / 2);
  if (week < 0 || week >= layout.weekCount || day < 0 || day >= DAYS) {
    return null;
  }
  return { day, week };
};
