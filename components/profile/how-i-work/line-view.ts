import {
  axisVector,
  circleRing,
  fitProjection,
  iso,
  pathOf,
} from "@/components/iso/iso-kit";
import type { Flat, Point3, Projection } from "@/components/iso/iso-kit";

import { directionOf, frameAt, placeIn } from "./line-kit";
import { TURN_DEGREES } from "./line-model";

export const LINE_WIDTH = 600;

export const AZIMUTH = 45;
export const ELEVATION = 36;
export const PAD = 14;

export const BASE_R = 132;
export const BASE_Z = -12;
export const FLOOR_Z = -17;
export const BEARING_R = 80;
export const TABLE_R = 76;
export const TABLE_Z = 5;
export const TABLE_TOP = 15;
export const NEST_R = 52;
export const NEST_SIZE = 12;
export const NEST_TOP = TABLE_TOP + 2.5;
export const PUCK_R = 8;
export const PUCK_TOP = NEST_TOP + 4;
export const BOSS_TOP = PUCK_TOP + 2;
export const STATION_R = 100;
export const REACH = STATION_R - NEST_R;
export const RIM_RULE = 71;
export const PIN_TRAVEL = 5;
export const CONSOLE_AT = { degrees: 57, radius: 174 } as const;

export const stationDegrees = (station: number) => -90 - TURN_DEGREES * station;

const unitProjection: Projection = {
  azimuth: AZIMUTH,
  elevation: ELEVATION,
  origin: [0, 0],
  scale: 1,
};

const ringPoints = (radius: number, z: number, count = 48): Point3[] =>
  circleRing(0, 0, radius, count).map(([x, y]) => [x, y, z]);

const consoleCenter = (projection: Projection): Point3 => {
  const [x, y] = directionOf(projection, CONSOLE_AT.degrees);
  return [x * CONSOLE_AT.radius, y * CONSOLE_AT.radius, 0];
};

const fitPoints = (projection: Projection): Point3[] => {
  const [cx, cy] = consoleCenter(projection);
  return [
    ...ringPoints(BASE_R, FLOOR_Z),
    ...ringPoints(BASE_R, 0),
    ...[0, 1, 2, 3, 4, 5].flatMap((station): Point3[] => {
      const [x, y] = directionOf(projection, stationDegrees(station));
      return [
        [x * STATION_R, y * STATION_R, 100],
        [x * NEST_R, y * NEST_R, 100],
      ];
    }),
    [cx + 14, cy + 14, FLOOR_Z],
    [cx - 14, cy - 14, 22],
    [cx + 14, cy - 14, FLOOR_Z],
  ];
};

const fitHeight = () => {
  const flat = fitPoints(unitProjection).map((point) =>
    iso(point, unitProjection)
  );
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const aspect =
    (Math.max(...ys) - Math.min(...ys)) / (Math.max(...xs) - Math.min(...xs));
  return Math.round((LINE_WIDTH - PAD * 2) * aspect + PAD * 2);
};

export const LINE_HEIGHT = fitHeight();

export const P = fitProjection(
  fitPoints(unitProjection),
  LINE_WIDTH,
  LINE_HEIGHT,
  { azimuth: AZIMUTH, elevation: ELEVATION, pad: PAD }
);

export const DIAL_FACE = 42.4;
export const NEEDLE_REST = -40;
export const NEEDLE_SWING = 64;

export const TOOL_DROPS = [37 - NEST_TOP, 10, 14.5, 8, 1.5, 6.5] as const;

const join = (paths: readonly string[]) => paths.join("");

export const directionDepth = ([x, y]: readonly number[]) =>
  (x ?? 0) * Math.cos((AZIMUTH * Math.PI) / 180) +
  (y ?? 0) * Math.sin((AZIMUTH * Math.PI) / 180);

export const zShift = (dz: number) => axisVector(P, [0, 0, dz]);

export const nestCenter = (degrees: number): Flat => {
  const [x, y] = directionOf(P, degrees);
  return [x * NEST_R, y * NEST_R];
};

export const nestShift = (from: number, to: number): Flat => {
  const [fx, fy] = nestCenter(from);
  const [tx, ty] = nestCenter(to);
  return axisVector(P, [tx - fx, ty - fy, 0]);
};

export const pinShift = (share: number) => {
  const [x, y] = directionOf(P, 0);
  return axisVector(P, [x * PIN_TRAVEL * share, y * PIN_TRAVEL * share, 0]);
};

export const toTransform = ([dx, dy]: Flat) =>
  `translate(${Math.round(dx * 100) / 100} ${Math.round(dy * 100) / 100})`;

export const tableMarks = (turns: number) => {
  const minor: string[] = [];
  const major: string[] = [];
  const notches: string[] = [];
  const [vx, vy] = directionOf(P, 0);
  const offset = -turns * TURN_DEGREES;
  for (let index = 0; index < 72; index += 1) {
    const degrees = index * 5 + offset - 90;
    const [x, y] = directionOf(P, degrees);
    const isMajor = index % 6 === 0;
    const tick = pathOf([
      iso([x * RIM_RULE, y * RIM_RULE, TABLE_TOP], P),
      iso(
        [x * (isMajor ? 74.6 : 73.2), y * (isMajor ? 74.6 : 73.2), TABLE_TOP],
        P
      ),
    ]);
    (isMajor ? major : minor).push(tick);
    if (isMajor && x * vx + y * vy > 0.16) {
      notches.push(
        pathOf([
          iso([x * TABLE_R, y * TABLE_R, TABLE_Z + 3.5], P),
          iso([x * TABLE_R, y * TABLE_R, TABLE_TOP - 0.2], P),
        ])
      );
    }
  }
  return { major: join(major), minor: join(minor), notches: join(notches) };
};

export const needleAt = (degrees: number) => {
  const frame = frameAt(P, stationDegrees(4), STATION_R);
  const [cx, cy] = placeIn(frame, -REACH, 0);
  const angle = ((degrees - 90) * Math.PI) / 180;
  const [dx, dy] = directionOf(P, 0);
  const [ex, ey] = directionOf(P, 90);
  const toward = (length: number): Point3 => [
    cx + (ex * Math.cos(angle) + dx * Math.sin(angle)) * length,
    cy + (ey * Math.cos(angle) + dy * Math.sin(angle)) * length,
    DIAL_FACE + 0.2,
  ];
  return pathOf([iso(toward(-1.6), P), iso(toward(5.4), P)]);
};
