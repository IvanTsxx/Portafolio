import type { Point3, Projection } from "@/components/iso/iso-kit";

import {
  ARM_LENGTH,
  ARM_T,
  ARM_X,
  CLOCK_X,
  DIAL_DEPTH,
  DIAL_R,
  DIAL_Z,
  FRONT_Y,
  HUB,
  KNOB_LENGTH,
  KNOB_R,
} from "./clock-layout";
import type { Frame } from "./prism";
import {
  add,
  circleOf,
  linePath,
  prismOf,
  rectRing,
  ringIn,
  scale,
} from "./prism";

const RADIANS = Math.PI / 180;
const FACE_Y = FRONT_Y + DIAL_DEPTH + 0.2;

const alongX = (origin: Point3, length: number): Frame => ({
  origin,
  u: [0, 1, 0],
  v: [0, 0, 1],
  w: [length, 0, 0],
});

export const leverOf = (degrees: number, P: Projection) => {
  const theta = degrees * RADIANS;
  const along: Point3 = [0, Math.sin(theta), Math.cos(theta)];
  const across: Point3 = [0, Math.cos(theta), -Math.sin(theta)];
  const pivot: Point3 = [ARM_X, HUB[1], HUB[2]];
  const arm = prismOf(
    rectRing(-3.4, -1.7, ARM_LENGTH, 1.7, 1.6),
    { origin: pivot, u: along, v: across, w: [ARM_T, 0, 0] },
    P
  );
  const end = add(pivot, scale(along, ARM_LENGTH));
  const knobAt: Point3 = [ARM_X - 1.5, end[1], end[2]];
  const knob = prismOf(circleOf(KNOB_R, 28), alongX(knobAt, KNOB_LENGTH), P);
  const capFrame = alongX([ARM_X + ARM_T, HUB[1], HUB[2]], 0.9);
  const cap = prismOf(circleOf(2.1, 20), capFrame, P);
  const faceFrame = alongX([knobAt[0] + KNOB_LENGTH, knobAt[1], knobAt[2]], 0);
  return {
    arm,
    cap,
    knob,
    knobFace: ringIn(faceFrame, circleOf(KNOB_R - 1.3, 24), P),
  };
};

export type LeverPaths = ReturnType<typeof leverOf>;

const handPoint = (angle: number, length: number): Point3 => [
  CLOCK_X + Math.sin(angle) * length,
  FACE_Y,
  DIAL_Z + Math.cos(angle) * length,
];

export const handsOf = (seconds: number, P: Projection) => {
  const minuteTurn = (seconds / 3600) % 1;
  const hourTurn = (seconds / 43_200) % 1;
  const secondTurn = (seconds / 60) % 1;
  const hand = (turn: number, length: number, tail: number) => {
    const angle = turn * Math.PI * 2;
    return linePath(
      [handPoint(angle + Math.PI, tail), handPoint(angle, length)],
      P
    );
  };
  return {
    hour: hand(hourTurn, DIAL_R * 0.5, 1.6),
    minute: hand(minuteTurn, DIAL_R * 0.74, 2),
    second: hand(secondTurn, DIAL_R * 0.84, 3.6),
  };
};

export type HandPaths = ReturnType<typeof handsOf>;

export const REST_SECONDS = 10 * 3600 + 8 * 60 + 42;
