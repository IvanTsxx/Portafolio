import {
  circleRing,
  cylinder,
  extrude,
  iso,
  knurl,
  pathOf,
  ring,
  roundedPlan,
  sideArc,
  towardViewer,
} from "@/components/iso/iso-kit";
import type {
  Flat,
  LineTone,
  Plane,
  Projection,
  SolidPaths,
  Tone,
} from "@/components/iso/iso-kit";

const RADIANS = Math.PI / 180;

export type Part =
  | {
      crease?: Tone | "none";
      inner?: string;
      kind: "solid";
      paths: SolidPaths;
      tone: Tone;
    }
  | { d: string; free?: boolean; kind: "line"; name?: string; tone: LineTone }
  | { kind: "dots"; points: readonly Flat[]; size: number; tone: Tone }
  | { d: string; kind: "halo" }
  | { center: Flat; kind: "ball"; radius: number; shine: Flat }
  | {
      kind: "group";
      name: string;
      opacity?: number;
      parts: readonly Part[];
      value?: string;
    };

export interface Frame {
  a: Plane;
  b: Plane;
  o: Plane;
}

export const directionOf = (projection: Projection, degrees: number): Plane => {
  const [vx, vy] = towardViewer(projection);
  const angle = degrees * RADIANS;
  return [
    vx * Math.cos(angle) + vy * Math.sin(angle),
    vy * Math.cos(angle) - vx * Math.sin(angle),
  ];
};

export const frameAt = (
  projection: Projection,
  degrees: number,
  radius: number
): Frame => {
  const a = directionOf(projection, degrees);
  return {
    a,
    b: directionOf(projection, degrees + 90),
    o: [a[0] * radius, a[1] * radius],
  };
};

export const placeIn = (frame: Frame, a: number, b: number): Plane => [
  frame.o[0] + frame.a[0] * a + frame.b[0] * b,
  frame.o[1] + frame.a[1] * a + frame.b[1] * b,
];

export interface Box {
  a0: number;
  a1: number;
  b0: number;
  b1: number;
  r?: number;
}

const ringIn = (frame: Frame, { a0, a1, b0, b1, r = 1 }: Box, steps: number) =>
  roundedPlan({ d: b1 - b0, r, w: a1 - a0, x: a0, y: b0 }, steps).map(
    ([a, b]) => placeIn(frame, a, b)
  );

const facingOf = (points: readonly Plane[], projection: Projection) => {
  const [vx, vy] = towardViewer(projection);
  let area = 0;
  for (const [index, [ax, ay]] of points.entries()) {
    const [bx, by] = points[(index + 1) % points.length] ?? [ax, ay];
    area += ax * by - bx * ay;
  }
  const sign = area > 0 ? 1 : -1;
  return points.map(([ax, ay], index) => {
    const [bx, by] = points[(index + 1) % points.length] ?? [ax, ay];
    return (by - ay) * sign * vx - (bx - ax) * sign * vy > 1e-9;
  });
};

const visibleRuns = (
  points: readonly Plane[],
  facing: readonly boolean[],
  z: number,
  projection: Projection
) => {
  const count = points.length;
  const start = facing.findIndex(
    (isFacing, index) => isFacing && !facing[(index + count - 1) % count]
  );
  if (start === -1) {
    return "";
  }
  const runs: Flat[][] = [];
  let run: Flat[] | null = null;
  for (let step = 0; step < count; step += 1) {
    const index = (start + step) % count;
    const point = points[index];
    const next = points[(index + 1) % count];
    if (facing[index] && point && next) {
      run ??= [iso([point[0], point[1], z], projection)];
      run.push(iso([next[0], next[1], z], projection));
    } else if (run) {
      runs.push(run);
      run = null;
    }
  }
  if (run) {
    runs.push(run);
  }
  return runs.map((segment) => pathOf(segment)).join("");
};

export const kitFor = (projection: Projection) => {
  const at = (frame: Frame, a: number, b: number, z: number): Flat => {
    const [x, y] = placeIn(frame, a, b);
    return iso([x, y, z], projection);
  };

  const box = (
    frame: Frame,
    plan: Box,
    z: number,
    height: number,
    bevel = 0,
    steps = 4
  ) => extrude(ringIn(frame, plan, steps), z, height, projection, bevel);

  const seam = (frame: Frame, plan: Box, z: number, steps = 4) => {
    const points = ringIn(frame, plan, steps);
    return visibleRuns(points, facingOf(points, projection), z, projection);
  };

  const outline = (frame: Frame, plan: Box, z: number, steps = 4) =>
    pathOf(
      ringIn(frame, plan, steps).map(([x, y]) => iso([x, y, z], projection)),
      true
    );

  const round = (
    frame: Frame,
    a: number,
    b: number,
    radius: number,
    z: number,
    height: number,
    steps = 32
  ) => {
    const [x, y] = placeIn(frame, a, b);
    return cylinder(x, y, radius, z, height, projection, steps);
  };

  const roundBevel = (
    frame: Frame,
    a: number,
    b: number,
    radius: number,
    z: number,
    height: number,
    bevel: number,
    steps = 48
  ) => {
    const [x, y] = placeIn(frame, a, b);
    return extrude(
      circleRing(x, y, radius, steps),
      z,
      height,
      projection,
      bevel
    );
  };

  const hoop = (
    frame: Frame,
    a: number,
    b: number,
    radius: number,
    z: number,
    steps = 40
  ) => {
    const [x, y] = placeIn(frame, a, b);
    return ring(x, y, radius, z, projection, steps);
  };

  const band = (
    frame: Frame,
    a: number,
    b: number,
    radius: number,
    z: number,
    steps = 24
  ) => {
    const [x, y] = placeIn(frame, a, b);
    return sideArc(x, y, radius, z, projection, steps);
  };

  const ribs = (
    frame: Frame,
    a: number,
    b: number,
    radius: number,
    span: readonly [number, number],
    count: number
  ) => {
    const [x, y] = placeIn(frame, a, b);
    return knurl(x, y, radius, span, count, projection);
  };

  const ticksOn = (
    frame: Frame,
    a: number,
    b: number,
    radius: number,
    z: number,
    count: number,
    every: number,
    lengths: readonly [number, number]
  ) => {
    const minor: string[] = [];
    const major: string[] = [];
    const [x, y] = placeIn(frame, a, b);
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const isMajor = index % every === 0;
      const inner = radius - (isMajor ? lengths[1] : lengths[0]);
      const tick = pathOf([
        iso(
          [x + radius * Math.cos(angle), y + radius * Math.sin(angle), z],
          projection
        ),
        iso(
          [x + inner * Math.cos(angle), y + inner * Math.sin(angle), z],
          projection
        ),
      ]);
      (isMajor ? major : minor).push(tick);
    }
    return { major: major.join(""), minor: minor.join("") };
  };

  const ballAt = (
    frame: Frame,
    a: number,
    b: number,
    z: number,
    radius: number
  ): Part => {
    const center = at(frame, a, b, z);
    const k = projection.scale * Math.sqrt(1.6);
    return {
      center,
      kind: "ball",
      radius: radius * k,
      shine: [center[0] - radius * k * 0.34, center[1] - radius * k * 0.38],
    };
  };

  return {
    at,
    ballAt,
    band,
    box,
    hoop,
    outline,
    ribs,
    round,
    roundBevel,
    seam,
    ticksOn,
  };
};

export type LineKit = ReturnType<typeof kitFor>;

export const solid = (
  paths: SolidPaths,
  tone: Tone,
  crease: Tone | "none" = "faint",
  inner?: string
): Part => ({ crease, inner, kind: "solid", paths, tone });

export const line = (d: string, tone: LineTone, free = false): Part => ({
  d,
  free,
  kind: "line",
  tone,
});

export const dots = (
  points: readonly Flat[],
  size: number,
  tone: Tone = "mid"
): Part => ({ kind: "dots", points, size, tone });
