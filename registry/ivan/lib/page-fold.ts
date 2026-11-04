export interface Point {
  x: number;
  y: number;
}

export interface Stage {
  height: number;
  width: number;
}

export interface Fold {
  angle: number;
  depth: number;
  flap: Point[];
  midpoint: Point;
  peeled: Point[];
}

const minimumReach = 0.5;

const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;

const stageCorners = ({ width, height }: Stage): Point[] => [
  { x: 0, y: 0 },
  { x: width, y: 0 },
  { x: width, y: height },
  { x: 0, y: height },
];

const keepSide = (polygon: Point[], side: (point: Point) => number) => {
  const kept: Point[] = [];
  for (const [index, current] of polygon.entries()) {
    const next = polygon[(index + 1) % polygon.length] ?? current;
    const currentSide = side(current);
    const nextSide = side(next);
    if (currentSide >= 0) {
      kept.push(current);
    }
    if (currentSide >= 0 !== nextSide >= 0) {
      const share = currentSide / (currentSide - nextSide);
      kept.push({
        x: current.x + (next.x - current.x) * share,
        y: current.y + (next.y - current.y) * share,
      });
    }
  }
  return kept;
};

export const clampToStage = (stage: Stage, point: Point): Point => ({
  x: Math.min(point.x, stage.width - minimumReach),
  y: Math.min(point.y, stage.height - minimumReach),
});

export const foldCorner = (stage: Stage, tip: Point): Fold => {
  const corner = { x: stage.width, y: stage.height };
  const reach = { x: corner.x - tip.x, y: corner.y - tip.y };
  const length = Math.max(Math.hypot(reach.x, reach.y), minimumReach);
  const normal = { x: reach.x / length, y: reach.y / length };
  const midpoint = { x: (corner.x + tip.x) / 2, y: (corner.y + tip.y) / 2 };
  const offset = (point: Point) =>
    dot({ x: point.x - midpoint.x, y: point.y - midpoint.y }, normal);
  const peeled = keepSide(stageCorners(stage), offset);
  const flap = peeled.map((point) => {
    const distance = 2 * offset(point);
    return {
      x: point.x - distance * normal.x,
      y: point.y - distance * normal.y,
    };
  });
  return {
    angle: Math.atan2(-normal.y, -normal.x),
    depth: length / 2,
    flap,
    midpoint,
    peeled,
  };
};

export const restingTip = (stage: Stage, leg: number): Point => ({
  x: stage.width - leg,
  y: stage.height - leg,
});

export const openTip = (stage: Stage, leg: number): Point => ({
  x: leg - stage.height,
  y: leg - stage.width,
});

export const polygonArea = (polygon: Point[]) => {
  let twiceArea = 0;
  for (const [index, point] of polygon.entries()) {
    const next = polygon[(index + 1) % polygon.length] ?? point;
    twiceArea += point.x * next.y - next.x * point.y;
  }
  return Math.abs(twiceArea / 2);
};

export const peeledShare = (stage: Stage, tip: Point) =>
  polygonArea(foldCorner(stage, tip).peeled) / (stage.width * stage.height);

export const settleAxis = (
  from: number,
  to: number,
  velocity: number | null,
  seconds: number
) => {
  const distance = to - from;
  const limit = (3 * Math.abs(distance)) / seconds;
  const launch =
    velocity === null
      ? 3 * (distance / seconds)
      : Math.max(-limit, Math.min(limit, velocity * Math.sign(distance))) *
        Math.sign(distance);
  return (progress: number) => {
    const t = Math.min(1, Math.max(0, progress));
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      from + distance * (3 * t2 - 2 * t3) + launch * seconds * (t3 - 2 * t2 + t)
    );
  };
};

export const toClipPath = (polygon: Point[]) =>
  polygon.length < 3
    ? "polygon(0 0, 0 0, 0 0)"
    : `polygon(${polygon
        .map(({ x, y }) => `${x.toFixed(2)}px ${y.toFixed(2)}px`)
        .join(", ")})`;

export const easeOutQuart = (progress: number) => 1 - (1 - progress) ** 4;
