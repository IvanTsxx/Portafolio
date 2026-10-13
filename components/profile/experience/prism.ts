import { iso, pathOf } from "@/components/iso/iso-kit";
import type {
  Flat,
  Plane,
  Point3,
  Projection,
  SolidPaths,
} from "@/components/iso/iso-kit";

const RADIANS = Math.PI / 180;
const SHADES = 4;
const LIGHT_RISE = 0.7;

export interface Frame {
  origin: Point3;
  u: Point3;
  v: Point3;
  w: Point3;
}

export const add = (a: Point3, b: Point3): Point3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

export const scale = (a: Point3, by: number): Point3 => [
  a[0] * by,
  a[1] * by,
  a[2] * by,
];

const sub = (a: Point3, b: Point3): Point3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Point3, b: Point3): Point3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const unit = (a: Point3): Point3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};

export const viewOf = ({ azimuth, elevation }: Projection): Point3 => {
  const a = azimuth * RADIANS;
  const e = elevation * RADIANS;
  return [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
};

const lightOf = ({ azimuth }: Projection): Point3 => {
  const a = azimuth * RADIANS;
  return [-Math.sin(a), Math.cos(a), LIGHT_RISE];
};

const turn = (o: Flat, a: Flat, b: Flat) =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

const halfHull = (sorted: readonly Flat[]) => {
  const chain: Flat[] = [];
  for (const point of sorted) {
    let before = chain.at(-2);
    let last = chain.at(-1);
    while (before && last && turn(before, last, point) <= 0) {
      chain.pop();
      before = chain.at(-2);
      last = chain.at(-1);
    }
    chain.push(point);
  }
  return chain.slice(0, -1);
};

export const hullOf = (points: readonly Flat[]): readonly Flat[] => {
  const sorted = points.toSorted((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) {
    return sorted;
  }
  return [...halfHull(sorted), ...halfHull(sorted.toReversed())];
};

const runsOf = (flags: readonly boolean[], want: boolean) => {
  const count = flags.length;
  const start = flags.findIndex(
    (flag, index) => flag !== flags[(index + count - 1) % count]
  );
  if (start === -1) {
    return flags[0] === want
      ? [Array.from({ length: count + 1 }, (_, index) => index % count)]
      : [];
  }
  const runs: number[][] = [];
  let run: number[] | null = null;
  for (let step = 0; step < count; step += 1) {
    const index = (start + step) % count;
    if (flags[index] === want) {
      run ??= [index];
      run.push((index + 1) % count);
    } else if (run) {
      runs.push(run);
      run = null;
    }
  }
  if (run) {
    runs.push(run);
  }
  return runs;
};

const pick = (points: readonly Flat[], indexes: readonly number[]) =>
  indexes.flatMap((index) => {
    const point = points[index];
    return point ? [point] : [];
  });

export const placeIn = (frame: Frame, [a, b]: Plane): Point3 =>
  add(frame.origin, add(scale(frame.u, a), scale(frame.v, b)));

export const prismOf = (
  ring: readonly Plane[],
  frame: Frame,
  projection: Projection
): SolidPaths => {
  const count = ring.length;
  const view = viewOf(projection);
  const light = lightOf(projection);
  const base = ring.map((point) => placeIn(frame, point));
  const lid = base.map((point) => add(point, frame.w));
  let sum: Point3 = [0, 0, 0];
  for (const point of base) {
    sum = add(sum, point);
  }
  const center = scale(sum, 1 / Math.max(count, 1));
  const lidFaces = dot(frame.w, view) >= 0;
  const front = (lidFaces ? lid : base).map((point) => iso(point, projection));
  const back = (lidFaces ? base : lid).map((point) => iso(point, projection));
  const normals = base.map((point, index) => {
    const next = base[(index + 1) % count] ?? point;
    const normal = unit(cross(sub(next, point), frame.w));
    return dot(normal, sub(point, center)) < 0 ? scale(normal, -1) : normal;
  });
  const facing = normals.map((normal) => dot(normal, view) > 1e-9);
  const outline = runsOf(facing, false).map((run) => pathOf(pick(front, run)));
  const crease: string[] = [];
  for (const run of runsOf(facing, true)) {
    crease.push(pathOf(pick(front, run)));
    outline.push(pathOf(pick(back, run)));
  }
  for (let index = 0; index < count; index += 1) {
    if (facing[(index + count - 1) % count] !== facing[index]) {
      outline.push(pathOf([...pick(front, [index]), ...pick(back, [index])]));
    }
  }
  const buckets: string[][] = Array.from({ length: SHADES }, () => []);
  for (const [index, normal] of normals.entries()) {
    if (facing[index]) {
      const next = (index + 1) % count;
      const lit = (dot(normal, light) + 1) / 2;
      const shade = Math.min(SHADES - 1, Math.max(0, Math.floor(lit * SHADES)));
      buckets[shade]?.push(
        pathOf(
          pick([...front, ...back], [index, next, count + next, count + index]),
          true
        )
      );
    }
  }
  return {
    bevel: "",
    crease: crease.join(""),
    fill: pathOf(hullOf([...front, ...back]), true),
    outline: outline.join(""),
    shades: buckets.map((paths) => paths.join("")),
    top: pathOf(front, true),
  };
};

export const rectRing = (
  a0: number,
  b0: number,
  a1: number,
  b1: number,
  radius = 0,
  steps = 4
): Plane[] => {
  const r = Math.max(0, Math.min(radius, (a1 - a0) / 2, (b1 - b0) / 2));
  const arcs: readonly (readonly [number, number, number])[] = [
    [a1 - r, b0 + r, -90],
    [a1 - r, b1 - r, 0],
    [a0 + r, b1 - r, 90],
    [a0 + r, b0 + r, 180],
  ];
  const count = r > 0 ? steps : 0;
  return arcs.flatMap(([ca, cb, start]) =>
    Array.from({ length: count + 1 }, (_, step): Plane => {
      const angle = (start + (count ? (90 * step) / count : 45)) * RADIANS;
      return [ca + r * Math.cos(angle), cb + r * Math.sin(angle)];
    })
  );
};

export const circleOf = (radius: number, steps = 40): Plane[] =>
  Array.from({ length: steps }, (_, step): Plane => {
    const angle = (step / steps) * Math.PI * 2;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });

export const linePath = (
  points: readonly Point3[],
  projection: Projection,
  closed = false
) =>
  pathOf(
    points.map((point) => iso(point, projection)),
    closed
  );

export const ringIn = (
  frame: Frame,
  ring: readonly Plane[],
  projection: Projection,
  closed = true
) =>
  linePath(
    ring.map((point) => placeIn(frame, point)),
    projection,
    closed
  );

export const fine = (value: number) => Math.round(value * 100) / 100;

export const shiftOf = (projection: Projection, [x, y, z]: Point3) => {
  const origin = iso([0, 0, 0], projection);
  const moved = iso([x, y, z], projection);
  return `translate(${fine(moved[0] - origin[0])} ${fine(moved[1] - origin[1])})`;
};
