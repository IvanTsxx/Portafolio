import { fitProjection } from "@/components/iso/iso-kit";
import type { Plan, Point3, Projection } from "@/components/iso/iso-kit";

export const CLOCK_WIDTH = 600;
export const CLOCK_HEIGHT = 372;

const AZIMUTH = 64;

export const BASE_H = 10;
export const FOOT_H = 5;

export const BOARD_TOP = 78;

export const POCKET_PITCH = 24;
export const CHEEK = 4;
export const RACK_GAP = 8;
export const SHELF_LOW = 6;
export const SHELF_TOP = 9;
export const LIP_TOP = 32;
export const DIVIDER_TOP = 36;
export const HEADER_LOW = 54;
export const HEADER_TOP = 62;
export const RACK_BACK = -27;
export const LIP_BACK = -17.2;
export const LIP_FRONT = -16;

export const CARD_W = 18;
export const CARD_T = 0.8;
export const CARD_H = 38;
export const CARD_Y = -22.4;

export const CASE: Plan = { d: 40, r: 3, w: 56, x: 8, y: -22 };
export const PLINTH: Plan = { d: 48, r: 2, w: 64, x: 4, y: -26 };
export const CAP: Plan = { d: 44, r: 3, w: 60, x: 6, y: -24 };
export const PLINTH_TOP = 6;
export const CASE_TOP = 82;
export const CAP_TOP = 86;
export const THROAT: Plan = { d: 8, r: 1.5, w: 28, x: 22, y: -6 };
export const THROAT_TOP = 87.2;
export const SLOT: Plan = { d: 1.6, r: 0.8, w: 20, x: 26, y: -2.8 };
export const CLOCK_X = CASE.x + CASE.w / 2;
export const FRONT_Y = CASE.y + CASE.d;
export const SIDE_X = CASE.x + CASE.w;

export const DIAL_Z = 57;
export const DIAL_R = 16;
export const DIAL_DEPTH = 3;

export const SLOT_CARD_Y = SLOT.y + SLOT.d / 2 - CARD_T / 2;
export const HELD_BOTTOM = 66;
export const TRAVEL_BOTTOM = 91;
export const HOVER_LIFT = 8;

export const HUB: Point3 = [SIDE_X + 6, 6, 66];
export const HUB_R = 5;
export const ARM_X = HUB[0] + 3;
export const ARM_LENGTH = 26;
export const ARM_T = 2;
export const KNOB_R = 3.4;
export const KNOB_LENGTH = 6;
export const LEVER_REST = 14;
export const LEVER_PULLED = 72;

export interface Pocket {
  index: number;
  rack: 0 | 1;
  x: number;
}

const RACK_RIGHT = -16;
const BASE_RIGHT = 92;

export const rackWidth = (count: number) => count * POCKET_PITCH + CHEEK * 2;

export const rackLeft = (rack: 0 | 1, count: number) =>
  RACK_RIGHT - rackWidth(count) * (2 - rack) - RACK_GAP * (1 - rack);

export const boardOf = (count: number): Plan => {
  const x = rackLeft(0, count) - 6;
  return { d: 4, r: 1, w: RACK_RIGHT + 10 - x, x, y: -31 };
};

export const baseOf = (count: number): Plan => {
  const x = boardOf(count).x - 10;
  return { d: 68, r: 6, w: BASE_RIGHT - x, x, y: -40 };
};

export const pocketCenter = (rack: 0 | 1, index: number, count: number) =>
  rackLeft(rack, count) + CHEEK + index * POCKET_PITCH + POCKET_PITCH / 2;

export const pocketOf = (
  index: number,
  isCurrent: boolean,
  count: number
): Pocket => {
  const rack = isCurrent ? 1 : 0;
  return { index, rack, x: pocketCenter(rack, index, count) - CARD_W / 2 };
};

export const fitOf = (count: number): Projection => {
  const points: Point3[] = [];
  const base = baseOf(count);
  for (const x of [base.x, base.x + base.w]) {
    for (const y of [base.y, base.y + base.d]) {
      points.push([x, y, -BASE_H - FOOT_H]);
    }
  }
  const left = pocketCenter(0, 0, count) - CARD_W / 2;
  points.push(
    [left, CARD_Y, TRAVEL_BOTTOM + CARD_H],
    [CLOCK_X + CARD_W / 2, SLOT_CARD_Y, TRAVEL_BOTTOM + CARD_H],
    [HUB[0] + KNOB_LENGTH + 30, HUB[1], HUB[2] + ARM_LENGTH + 34]
  );
  return fitProjection(points, CLOCK_WIDTH, CLOCK_HEIGHT, {
    azimuth: AZIMUTH,
    pad: 10,
  });
};
