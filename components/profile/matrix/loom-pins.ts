import type { Flat } from "@/components/iso/iso-kit";

import { pinCornersOf } from "./loom-layout";
import type { LoomLayout } from "./loom-layout";
import { DAYS } from "./loom-model";

export interface PinPaths {
  edge: string;
  faceX: string;
  faceY: string;
  top: string;
}

export interface PinField {
  corners: Float32Array;
  order: readonly number[];
  rise: number;
}

const SHADES = 4;
const FLUSH = 0.05;

const shadeOf = (nx: number, ny: number, azimuth: number) => {
  const radians = (azimuth * Math.PI) / 180;
  const lit = (nx * -Math.sin(radians) + ny * Math.cos(radians) + 1) / 2;
  return Math.min(SHADES - 1, Math.max(0, Math.floor(lit * SHADES)));
};

export const pinShadesOf = (layout: LoomLayout) => ({
  faceX: shadeOf(1, 0, layout.projection.azimuth),
  faceY: shadeOf(0, 1, layout.projection.azimuth),
});

export const pinFieldOf = (layout: LoomLayout): PinField => {
  const count = layout.weekCount * DAYS;
  const corners = new Float32Array(count * 8);
  const depths: number[] = [];
  const radians = (layout.projection.azimuth * Math.PI) / 180;
  for (let cell = 0; cell < count; cell += 1) {
    const week = Math.floor(cell / DAYS);
    const day = cell % DAYS;
    for (const [index, [x, y]] of pinCornersOf(layout, week, day).entries()) {
      corners[cell * 8 + index * 2] = x;
      corners[cell * 8 + index * 2 + 1] = y;
    }
    depths.push(
      layout.weekX(week) * Math.cos(radians) +
        layout.dayY(day) * Math.sin(radians)
    );
  }
  const { cosE, k } = {
    cosE: Math.cos((layout.projection.elevation * Math.PI) / 180),
    k: layout.projection.scale * Math.sqrt(1.6),
  };
  return {
    corners,
    order: depths
      .map((depth, cell) => [depth, cell] as const)
      .toSorted((a, b) => a[0] - b[0] || a[1] - b[1])
      .map(([, cell]) => cell),
    rise: k * cosE,
  };
};

const tenth = (value: number) => Math.round(value * 10) / 10;

const at = ([x, y]: Flat) => `${tenth(x)} ${tenth(y)}`;

export const pinPathsOf = (
  field: PinField,
  cell: number,
  height: number
): PinPaths => {
  const { corners } = field;
  const offset = cell * 8;
  const lift = height * field.rise;
  const bottom = (index: number): Flat => [
    corners[offset + index * 2] ?? 0,
    corners[offset + index * 2 + 1] ?? 0,
  ];
  const top = (index: number): Flat => {
    const [x, y] = bottom(index);
    return [x, y - lift];
  };
  const t0 = at(top(0));
  const t1 = at(top(1));
  const t2 = at(top(2));
  const t3 = at(top(3));
  const topPath = `M${t0}L${t1}L${t2}L${t3}Z`;
  if (height < FLUSH) {
    return { edge: topPath, faceX: "", faceY: "", top: topPath };
  }
  const b1 = at(bottom(1));
  const b2 = at(bottom(2));
  const b3 = at(bottom(3));
  return {
    edge: `M${t3}L${t0}L${t1}L${b1}L${b2}L${b3}ZM${t1}L${t2}L${t3}`,
    faceX: `M${t1}L${t2}L${b2}L${b1}Z`,
    faceY: `M${t2}L${t3}L${b3}L${b2}Z`,
    top: topPath,
  };
};
