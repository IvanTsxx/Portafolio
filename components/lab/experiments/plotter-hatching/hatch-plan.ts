import { sampleInk } from "@/components/lab/source/ink-raster";
import type { InkRaster } from "@/components/lab/source/ink-raster";

export const hatchLayers = [
  { threshold: 0.3, turn: 0 },
  { threshold: 0.54, turn: Math.PI / 2 },
  { threshold: 0.78, turn: -Math.PI / 4 },
] as const;

export interface HatchSettings {
  angle: number;
  layers: number;
  pitch: number;
}

export interface HatchPlan {
  count: number;
  ends: Float64Array;
  segments: Float32Array;
  timelineLength: number;
}

export interface HatchPlanner {
  plan: HatchPlan;
  isDone: () => boolean;
  step: (hasTime: () => boolean) => void;
}

interface HatchLine {
  layer: number;
  offset: number;
}

const gapSamples = 1;
const travelShare = 0.25;
const minSamples = 3;

const linesFor = (
  width: number,
  height: number,
  settings: HatchSettings
): HatchLine[] => {
  const lines: HatchLine[] = [];
  const layerCount = Math.min(Math.max(settings.layers, 1), hatchLayers.length);
  for (let layer = 0; layer < layerCount; layer += 1) {
    const angle = settings.angle + (hatchLayers[layer]?.turn ?? 0);
    const reach =
      (Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle))) /
      2;
    const limit = Math.ceil(reach / settings.pitch);
    for (let line = -limit; line <= limit; line += 1) {
      lines.push({ layer, offset: (line + 0.5) * settings.pitch });
    }
  }
  return lines;
};

const spanOf = (
  originX: number,
  originY: number,
  directionX: number,
  directionY: number,
  width: number,
  height: number
) => {
  let near = Number.NEGATIVE_INFINITY;
  let far = Number.POSITIVE_INFINITY;
  const axes = [
    [originX, directionX, width],
    [originY, directionY, height],
  ] as const;
  for (const [origin, direction, size] of axes) {
    if (Math.abs(direction) < 1e-9) {
      if (origin < 0 || origin > size) {
        return null;
      }
      continue;
    }
    const first = -origin / direction;
    const second = (size - origin) / direction;
    near = Math.max(near, Math.min(first, second));
    far = Math.min(far, Math.max(first, second));
  }
  return near < far ? { far, near } : null;
};

export const createHatchPlanner = (
  raster: InkRaster,
  cell: number,
  settings: HatchSettings
): HatchPlanner => {
  const width = raster.width * cell;
  const height = raster.height * cell;
  const lines = linesFor(width, height, settings);
  const sampleSpacing = settings.pitch / 3;
  const plan: HatchPlan = {
    count: 0,
    ends: new Float64Array(1024),
    segments: new Float32Array(4096),
    timelineLength: 0,
  };
  let nextLine = 0;
  let isReversed = false;
  let previousLayer = 0;

  const push = (x0: number, y0: number, x1: number, y1: number) => {
    if (plan.count * 4 + 4 > plan.segments.length) {
      const segments = new Float32Array(plan.segments.length * 2);
      segments.set(plan.segments);
      plan.segments = segments;
      const ends = new Float64Array(plan.ends.length * 2);
      ends.set(plan.ends);
      plan.ends = ends;
    }
    if (plan.count > 0) {
      const previous = plan.count * 4 - 2;
      plan.timelineLength +=
        Math.hypot(
          x0 - (plan.segments[previous] ?? 0),
          y0 - (plan.segments[previous + 1] ?? 0)
        ) * travelShare;
    }
    plan.segments.set([x0, y0, x1, y1], plan.count * 4);
    plan.timelineLength += Math.hypot(x1 - x0, y1 - y0);
    plan.ends[plan.count] = plan.timelineLength;
    plan.count += 1;
  };

  const traceLine = ({ layer, offset }: HatchLine) => {
    const hatch = hatchLayers[layer];
    if (!hatch) {
      return;
    }
    const angle = settings.angle + hatch.turn;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const originX = width / 2 - directionY * offset;
    const originY = height / 2 + directionX * offset;
    const span = spanOf(
      originX,
      originY,
      directionX,
      directionY,
      width,
      height
    );
    if (!span) {
      return;
    }
    const count = Math.floor((span.far - span.near) / sampleSpacing) + 1;
    const runs: number[] = [];
    let runStart = -1;
    let lastInk = -1;
    for (let index = 0; index <= count; index += 1) {
      const along = span.near + index * sampleSpacing;
      const isInk =
        index < count &&
        sampleInk(
          raster,
          (originX + directionX * along) / cell,
          (originY + directionY * along) / cell
        ) > hatch.threshold;
      if (isInk) {
        if (runStart < 0 || index - lastInk > gapSamples + 1) {
          if (runStart >= 0 && lastInk - runStart + 1 >= minSamples) {
            runs.push(runStart, lastInk);
          }
          runStart = index;
        }
        lastInk = index;
      }
    }
    if (runStart >= 0 && lastInk - runStart + 1 >= minSamples) {
      runs.push(runStart, lastInk);
    }
    const order = runs.length / 2;
    for (let slot = 0; slot < order; slot += 1) {
      const run = isReversed ? order - 1 - slot : slot;
      const first = span.near + (runs[run * 2] ?? 0) * sampleSpacing;
      const last = span.near + (runs[run * 2 + 1] ?? 0) * sampleSpacing;
      const [from, to] = isReversed ? [last, first] : [first, last];
      push(
        originX + directionX * from,
        originY + directionY * from,
        originX + directionX * to,
        originY + directionY * to
      );
    }
    if (order > 0) {
      isReversed = !isReversed;
    }
  };

  return {
    isDone: () => nextLine >= lines.length,
    plan,
    step: (hasTime) => {
      while (nextLine < lines.length && hasTime()) {
        const line = lines[nextLine];
        if (line) {
          if (line.layer !== previousLayer) {
            previousLayer = line.layer;
            isReversed = false;
          }
          traceLine(line);
        }
        nextLine += 1;
      }
    },
  };
};

const strokeAt = (plan: HatchPlan, length: number) => {
  let low = 0;
  let high = plan.count;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if ((plan.ends[middle] ?? 0) <= length) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
};

export interface PenPoint {
  x: number;
  y: number;
}

const pointAlong = (plan: HatchPlan, stroke: number, length: number) => {
  const base = stroke * 4;
  const x0 = plan.segments[base] ?? 0;
  const y0 = plan.segments[base + 1] ?? 0;
  const x1 = plan.segments[base + 2] ?? 0;
  const y1 = plan.segments[base + 3] ?? 0;
  const end = plan.ends[stroke] ?? 0;
  const strokeLength = Math.hypot(x1 - x0, y1 - y0);
  const start = end - strokeLength;
  const amount =
    strokeLength > 0
      ? Math.min(Math.max((length - start) / strokeLength, 0), 1)
      : 1;
  return { x: x0 + (x1 - x0) * amount, y: y0 + (y1 - y0) * amount };
};

export const penAt = (plan: HatchPlan, length: number): PenPoint | null => {
  if (plan.count === 0) {
    return null;
  }
  const stroke = Math.min(strokeAt(plan, length), plan.count - 1);
  const base = stroke * 4;
  const startX = plan.segments[base] ?? 0;
  const startY = plan.segments[base + 1] ?? 0;
  const start =
    (plan.ends[stroke] ?? 0) -
    Math.hypot(
      (plan.segments[base + 2] ?? 0) - startX,
      (plan.segments[base + 3] ?? 0) - startY
    );
  const travelStart = plan.ends[stroke - 1] ?? 0;
  if (stroke === 0 || length >= start || start <= travelStart) {
    return pointAlong(plan, stroke, length);
  }
  const fromX = plan.segments[base - 2] ?? 0;
  const fromY = plan.segments[base - 1] ?? 0;
  const amount = Math.max((length - travelStart) / (start - travelStart), 0);
  return {
    x: fromX + (startX - fromX) * amount,
    y: fromY + (startY - fromY) * amount,
  };
};

export interface PenPath {
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
}

export const traceSpan = (
  path: PenPath,
  plan: HatchPlan,
  from: number,
  to: number
) => {
  if (to <= from || plan.count === 0) {
    return;
  }
  const last = Math.min(strokeAt(plan, to), plan.count - 1);
  for (let stroke = strokeAt(plan, from); stroke <= last; stroke += 1) {
    const end = plan.ends[stroke] ?? 0;
    const base = stroke * 4;
    const strokeLength = Math.hypot(
      (plan.segments[base + 2] ?? 0) - (plan.segments[base] ?? 0),
      (plan.segments[base + 3] ?? 0) - (plan.segments[base + 1] ?? 0)
    );
    const pieceStart = Math.max(from, end - strokeLength);
    const pieceEnd = Math.min(to, end);
    if (pieceEnd <= pieceStart) {
      continue;
    }
    const head = pointAlong(plan, stroke, pieceStart);
    const tail = pointAlong(plan, stroke, pieceEnd);
    path.moveTo(head.x, head.y);
    path.lineTo(tail.x, tail.y);
  }
};
