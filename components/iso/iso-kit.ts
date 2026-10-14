export type Flat = readonly [number, number];
export type Point3 = readonly [number, number, number];
type Plane = readonly [number, number];

export interface Projection {
  azimuth: number;
  elevation: number;
  origin: Flat;
  scale: number;
}

export interface Plan {
  d: number;
  r: number;
  w: number;
  x: number;
  y: number;
}

export interface SolidPaths {
  bevel: string;
  crease: string;
  fill: string;
  outline: string;
  shades: readonly string[];
  top: string;
}

export type Tone = "hi" | "mid" | "lo" | "faint";
export type LineTone = Tone | "lit";

const RADIANS = Math.PI / 180;
const UNIT = Math.sqrt(1.6);
const SHADES = 4;

interface Camera {
  cosA: number;
  cosE: number;
  k: number;
  sinA: number;
  sinE: number;
}

const cameraOf = ({ azimuth, elevation, scale }: Projection): Camera => ({
  cosA: Math.cos(azimuth * RADIANS),
  cosE: Math.cos(elevation * RADIANS),
  k: scale * UNIT,
  sinA: Math.sin(azimuth * RADIANS),
  sinE: Math.sin(elevation * RADIANS),
});

export const iso = ([x, y, z]: Point3, projection: Projection): Flat => {
  const { cosA, cosE, k, sinA, sinE } = cameraOf(projection);
  return [
    projection.origin[0] + (x * sinA - y * cosA) * k,
    projection.origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k,
  ];
};

const towardViewer = (projection: Projection): Plane => {
  const { cosA, sinA } = cameraOf(projection);
  return [cosA, sinA];
};

const tenth = (value: number) => {
  const text = (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/u, "");
  return text === "-0" ? "0" : text;
};

const pathOf = (points: readonly Flat[], closed = false) => {
  if (points.length === 0) {
    return "";
  }
  const body = points
    .map(([x, y], index) => `${index ? "L" : "M"}${tenth(x)} ${tenth(y)}`)
    .join("");
  return closed ? `${body}Z` : body;
};

const roundedPlan = ({ d, r, w, x, y }: Plan, steps = 8): Plane[] => {
  const radius = Math.max(0, Math.min(r, w / 2, d / 2));
  const arcs: readonly (readonly [number, number, number])[] = [
    [x + w - radius, y + radius, -90],
    [x + w - radius, y + d - radius, 0],
    [x + radius, y + d - radius, 90],
    [x + radius, y + radius, 180],
  ];
  const count = radius > 0 ? steps : 0;
  return arcs.flatMap(([cx, cy, start]) =>
    Array.from({ length: count + 1 }, (_, step): Plane => {
      const angle = (start + (count ? (90 * step) / count : 45)) * RADIANS;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    })
  );
};

const signedArea = (points: readonly Flat[]) => {
  let area = 0;
  for (const [index, [ax, ay]] of points.entries()) {
    const [bx, by] = points[(index + 1) % points.length] ?? [ax, ay];
    area += ax * by - bx * ay;
  }
  return area / 2;
};

const oriented = (points: readonly Flat[]) =>
  signedArea(points) < 0 ? points.toReversed() : points;

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

const convexHull = (points: readonly Flat[]): readonly Flat[] => {
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

const quad = (
  top: readonly Flat[],
  bottom: readonly Flat[],
  index: number,
  next: number
) =>
  pathOf(
    oriented(
      pick(
        [...top, ...bottom],
        [index, next, top.length + next, top.length + index]
      )
    ),
    true
  );

const normalsOf = (ring: readonly Plane[]) => {
  const counter = signedArea(ring) > 0;
  return ring.map(([ax, ay], index): Plane => {
    const [bx, by] = ring[(index + 1) % ring.length] ?? [ax, ay];
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy) || 1;
    return counter ? [dy / length, -dx / length] : [-dy / length, dx / length];
  });
};

const bevelOf = (
  ring: readonly Plane[],
  normals: readonly Plane[],
  facing: readonly boolean[],
  top: readonly Flat[],
  height: number,
  by: number,
  projection: Projection
) => {
  const count = ring.length;
  const insetTop = ring.map(([x, y], index) => {
    const [ax, ay] = normals[(index + count - 1) % count] ?? [0, 0];
    const [bx, bw] = normals[index] ?? [0, 0];
    const mx = ax + bx;
    const my = ay + bw;
    const length = Math.hypot(mx, my) || 1;
    return iso(
      [x - (mx / length) * by, y - (my / length) * by, height],
      projection
    );
  });
  return runsOf(facing, true)
    .map((run) =>
      pathOf([
        ...pick(top, run.slice(0, 1)),
        ...pick(insetTop, run.slice(1, -1)),
        ...pick(top, run.slice(-1)),
      ])
    )
    .join("");
};

const extrude = (
  ring: readonly Plane[],
  z: number,
  height: number,
  projection: Projection,
  bevel = 0
): SolidPaths => {
  const count = ring.length;
  const [vx, vy] = towardViewer(projection);
  const { cosA, sinA } = cameraOf(projection);
  const normals = normalsOf(ring);
  const facing = normals.map(([nx, ny]) => nx * vx + ny * vy > 1e-9);
  const top = ring.map(([x, y]) => iso([x, y, z + height], projection));
  const bottom = ring.map(([x, y]) => iso([x, y, z], projection));
  const outline = runsOf(facing, false).map((run) => pathOf(pick(top, run)));
  const crease: string[] = [];
  for (const run of runsOf(facing, true)) {
    crease.push(pathOf(pick(top, run)));
    if (height > 0) {
      outline.push(pathOf(pick(bottom, run)));
    }
  }
  if (height > 0) {
    for (let index = 0; index < count; index += 1) {
      if (facing[(index + count - 1) % count] !== facing[index]) {
        outline.push(pathOf([...pick(top, [index]), ...pick(bottom, [index])]));
      }
    }
  }
  const buckets: string[][] = Array.from({ length: SHADES }, () => []);
  if (height > 0) {
    for (const [index, [nx, ny]] of normals.entries()) {
      if (facing[index]) {
        const lit = (nx * -sinA + ny * cosA + 1) / 2;
        const shade = Math.min(
          SHADES - 1,
          Math.max(0, Math.floor(lit * SHADES))
        );
        buckets[shade]?.push(quad(top, bottom, index, (index + 1) % count));
      }
    }
  }
  return {
    bevel:
      bevel > 0
        ? bevelOf(ring, normals, facing, top, z + height, bevel, projection)
        : "",
    crease: crease.join(""),
    fill: pathOf(convexHull([...top, ...bottom]), true),
    outline: outline.join(""),
    shades: buckets.map((paths) => paths.join("")),
    top: pathOf(oriented(top), true),
  };
};

export const slabOf = (
  plan: Plan,
  z: number,
  height: number,
  projection: Projection,
  steps = 8,
  bevel = 0
) => extrude(roundedPlan(plan, steps), z, height, projection, bevel);

const circleRing = (
  cx: number,
  cy: number,
  radius: number,
  steps = 40
): Plane[] =>
  Array.from({ length: steps }, (_, step): Plane => {
    const angle = (step / steps) * Math.PI * 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });

export const cylinder = (
  cx: number,
  cy: number,
  radius: number,
  z: number,
  height: number,
  projection: Projection,
  steps = 32
) => extrude(circleRing(cx, cy, radius, steps), z, height, projection);

export const insetPlan = ({ d, r, w, x, y }: Plan, by: number): Plan => ({
  d: d - by * 2,
  r: Math.max(0, r - by),
  w: w - by * 2,
  x: x + by,
  y: y + by,
});

export const onTop = (
  points: readonly Plane[],
  z: number,
  projection: Projection,
  closed = false
) =>
  pathOf(
    points.map(([x, y]) => iso([x, y, z], projection)),
    closed
  );

export const planOutline = (
  plan: Plan,
  z: number,
  projection: Projection,
  steps = 8
) => onTop(roundedPlan(plan, steps), z, projection, true);

export const segment = (from: Point3, to: Point3, projection: Projection) =>
  pathOf([iso(from, projection), iso(to, projection)]);

export const ring = (
  cx: number,
  cy: number,
  radius: number,
  z: number,
  projection: Projection,
  steps = 40
) => onTop(circleRing(cx, cy, radius, steps), z, projection, true);

export const corners = ({ d, w, x, y }: Plan, inset = 0): Plane[] => [
  [x + inset, y + inset],
  [x + w - inset, y + inset],
  [x + inset, y + d - inset],
  [x + w - inset, y + d - inset],
];

export const knurl = (
  cx: number,
  cy: number,
  radius: number,
  span: readonly [number, number],
  count: number,
  projection: Projection
) => {
  const [vx, vy] = towardViewer(projection);
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    if (nx * vx + ny * vy < 0.15) {
      return "";
    }
    const px = cx + radius * nx;
    const py = cy + radius * ny;
    return segment(
      [px, py, span[0] + 0.4],
      [px, py, span[1] - 0.4],
      projection
    );
  }).join("");
};

export const sideArc = (
  cx: number,
  cy: number,
  radius: number,
  z: number,
  projection: Projection,
  steps = 24
) => {
  const [vx, vy] = towardViewer(projection);
  const facing = Math.atan2(vy, vx);
  return pathOf(
    Array.from({ length: steps + 1 }, (_, step) => {
      const angle = facing - Math.PI / 2 + (step / steps) * Math.PI;
      return iso(
        [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), z],
        projection
      );
    })
  );
};

export const sideSeam = (
  plan: Plan,
  z: number,
  projection: Projection,
  steps = 8
) => {
  const plane = roundedPlan(plan, steps);
  const [vx, vy] = towardViewer(projection);
  const facing = normalsOf(plane).map(([nx, ny]) => nx * vx + ny * vy > 1e-9);
  const flat = plane.map(([x, y]) => iso([x, y, z], projection));
  return runsOf(facing, true)
    .map((run) => pathOf(pick(flat, run)))
    .join("");
};

export const axisVector = (projection: Projection, by: Point3): Flat => {
  const origin = iso([0, 0, 0], projection);
  const moved = iso(by, projection);
  return [moved[0] - origin[0], moved[1] - origin[1]];
};

const thousandth = (value: number) => String(Math.round(value * 1000) / 1000);

export const planeMatrix = (
  origin: Point3,
  across: Point3,
  down: Point3,
  projection: Projection
) => {
  const [ox, oy] = iso(origin, projection);
  const [ax, ay] = axisVector(projection, across);
  const [dx, dy] = axisVector(projection, down);
  return `matrix(${[ax, ay, dx, dy, ox, oy].map(thousandth).join(" ")})`;
};

export const fitWidth = (
  points: readonly Point3[],
  width: number,
  {
    azimuth,
    elevation = 30,
    maxHeight = Number.POSITIVE_INFINITY,
    pad = 24,
  }: {
    azimuth: number;
    elevation?: number;
    maxHeight?: number;
    pad?: number;
  }
) => {
  const unit: Projection = { azimuth, elevation, origin: [0, 0], scale: 1 };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const left = Math.min(...xs);
  const up = Math.min(...ys);
  const spanX = Math.max(...xs) - left;
  const spanY = Math.max(...ys) - up;
  const scale = Math.min(
    (width - pad * 2) / spanX,
    (maxHeight - pad * 2) / spanY
  );
  const projection: Projection = {
    azimuth,
    elevation,
    origin: [pad - left * scale, pad - up * scale],
    scale,
  };
  return {
    height: Math.ceil(spanY * scale + pad * 2),
    projection,
    width: Math.ceil(spanX * scale + pad * 2),
  };
};

export const shiftProjection = (
  projection: Projection,
  [dx, dy]: Flat
): Projection => ({
  ...projection,
  origin: [projection.origin[0] + dx, projection.origin[1] + dy],
});

export const fitProjection = (
  points: readonly Point3[],
  width: number,
  height: number,
  {
    azimuth,
    elevation = 30,
    pad = 24,
  }: { azimuth: number; elevation?: number; pad?: number }
): Projection => {
  const unit: Projection = { azimuth, elevation, origin: [0, 0], scale: 1 };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const up = Math.min(...ys);
  const down = Math.max(...ys);
  const scale = Math.min(
    (width - pad * 2) / (right - left),
    (height - pad * 2) / (down - up)
  );
  return {
    azimuth,
    elevation,
    origin: [
      width / 2 - ((left + right) / 2) * scale,
      height / 2 - ((up + down) / 2) * scale,
    ],
    scale,
  };
};
