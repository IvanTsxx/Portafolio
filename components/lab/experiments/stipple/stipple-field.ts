import type { InkRaster } from "@/components/lab/source/ink-raster";

export interface StippleField {
  width: number;
  height: number;
  weights: Float32Array;
  weightSum: number;
  weightPeak: number;
  count: number;
  points: Float32Array;
  sums: Float64Array;
  binSize: number;
  binColumns: number;
  binRows: number;
  binStarts: Int32Array;
  binPoints: Int32Array;
  row: number;
  iterations: number;
  calmIterations: number;
  movement: number;
  random: () => number;
}

const inkGamma = 1.6;
const pointsPerBin = 2;
const settledShare = 0.004;
const calmToSettle = 3;
const weightFloor = 0.002;
const swirlRate = 0.15;

const randomModulus = 2 ** 32;

export const seededRandom = (seed: number) => {
  let state = Math.abs(Math.floor(seed)) % randomModulus;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % randomModulus;
    return state / randomModulus;
  };
};

const weightsFrom = (raster: InkRaster) => {
  const weights = new Float32Array(raster.ink.length);
  let weightSum = 0;
  let weightPeak = 0;
  for (let index = 0; index < weights.length; index += 1) {
    const weight = (raster.ink[index] ?? 0) ** inkGamma;
    weights[index] = weight;
    weightSum += weight;
    weightPeak = Math.max(weightPeak, weight);
  }
  return { weightPeak, weightSum, weights };
};

const samplePoint = (field: StippleField, target: Float32Array, at: number) => {
  const { width, height, weights, weightPeak, random } = field;
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const x = random() * width;
    const y = random() * height;
    const weight = weights[Math.floor(y) * width + Math.floor(x)] ?? 0;
    if (random() * weightPeak < weight || attempt === 63) {
      target[at * 2] = x;
      target[at * 2 + 1] = y;
      return;
    }
  }
};

const rebuildBins = (field: StippleField) => {
  const { width, height, count, points } = field;
  const binSize = Math.max(
    1,
    Math.sqrt(
      (pointsPerBin * field.weightSum) /
        (Math.max(count, 1) * Math.max(field.weightPeak, 1e-6))
    )
  );
  const binColumns = Math.ceil(width / binSize);
  const binRows = Math.ceil(height / binSize);
  const binStarts = new Int32Array(binColumns * binRows + 1);
  const binOf = new Int32Array(count);
  for (let point = 0; point < count; point += 1) {
    const column = Math.min(
      Math.max(Math.floor((points[point * 2] ?? 0) / binSize), 0),
      binColumns - 1
    );
    const row = Math.min(
      Math.max(Math.floor((points[point * 2 + 1] ?? 0) / binSize), 0),
      binRows - 1
    );
    const bin = row * binColumns + column;
    binOf[point] = bin;
    binStarts[bin + 1] = (binStarts[bin + 1] ?? 0) + 1;
  }
  for (let bin = 0; bin < binColumns * binRows; bin += 1) {
    binStarts[bin + 1] = (binStarts[bin + 1] ?? 0) + (binStarts[bin] ?? 0);
  }
  const fill = binStarts.slice(0, binColumns * binRows);
  const binPoints = new Int32Array(count);
  for (let point = 0; point < count; point += 1) {
    const bin = binOf[point] ?? 0;
    const slot = fill[bin] ?? 0;
    binPoints[slot] = point;
    fill[bin] = slot + 1;
  }
  Object.assign(field, { binColumns, binPoints, binRows, binSize, binStarts });
};

const unsettle = (field: StippleField) => {
  field.calmIterations = 0;
};

export const createStippleField = (
  raster: InkRaster,
  count: number,
  seed = 7
): StippleField => {
  const field: StippleField = {
    ...weightsFrom(raster),
    binColumns: 1,
    binPoints: new Int32Array(0),
    binRows: 1,
    binSize: 1,
    binStarts: new Int32Array(2),
    calmIterations: 0,
    count,
    height: raster.height,
    iterations: 0,
    movement: Number.POSITIVE_INFINITY,
    points: new Float32Array(count * 2),
    random: seededRandom(seed),
    row: 0,
    sums: new Float64Array(count * 3),
    width: raster.width,
  };
  for (let point = 0; point < count; point += 1) {
    samplePoint(field, field.points, point);
  }
  rebuildBins(field);
  return field;
};

export const setStippleDensity = (field: StippleField, raster: InkRaster) => {
  const scaleX = raster.width / field.width;
  const scaleY = raster.height / field.height;
  if (scaleX !== 1 || scaleY !== 1) {
    for (let point = 0; point < field.count; point += 1) {
      field.points[point * 2] = (field.points[point * 2] ?? 0) * scaleX;
      field.points[point * 2 + 1] = (field.points[point * 2 + 1] ?? 0) * scaleY;
    }
  }
  Object.assign(field, weightsFrom(raster), {
    height: raster.height,
    row: 0,
    width: raster.width,
  });
  field.sums.fill(0);
  rebuildBins(field);
  unsettle(field);
};

export const setStippleCount = (field: StippleField, count: number) => {
  if (count === field.count) {
    return;
  }
  const points = new Float32Array(count * 2);
  points.set(field.points.subarray(0, Math.min(count, field.count) * 2));
  for (let point = field.count; point < count; point += 1) {
    samplePoint(field, points, point);
  }
  Object.assign(field, {
    count,
    points,
    row: 0,
    sums: new Float64Array(count * 3),
  });
  rebuildBins(field);
  unsettle(field);
};

interface Nearest {
  point: number;
  distance: number;
}

const scanBin = (
  field: StippleField,
  bin: number,
  x: number,
  y: number,
  nearest: Nearest
) => {
  const { binStarts, binPoints, points } = field;
  const end = binStarts[bin + 1] ?? 0;
  for (let slot = binStarts[bin] ?? 0; slot < end; slot += 1) {
    const point = binPoints[slot] ?? 0;
    const distance =
      ((points[point * 2] ?? 0) - x) ** 2 +
      ((points[point * 2 + 1] ?? 0) - y) ** 2;
    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.point = point;
    }
  }
};

const scanRing = (
  field: StippleField,
  column: number,
  row: number,
  ring: number,
  x: number,
  y: number,
  nearest: Nearest
) => {
  const { binColumns, binRows } = field;
  const firstRow = Math.max(row - ring, 0);
  const lastRow = Math.min(row + ring, binRows - 1);
  for (let binRow = firstRow; binRow <= lastRow; binRow += 1) {
    const isEdgeRow = binRow === row - ring || binRow === row + ring;
    const stride = isEdgeRow ? 1 : Math.max(ring * 2, 1);
    for (
      let binColumn = column - ring;
      binColumn <= column + ring;
      binColumn += stride
    ) {
      if (binColumn >= 0 && binColumn < binColumns) {
        scanBin(field, binRow * binColumns + binColumn, x, y, nearest);
      }
    }
  }
};

const nearestPoint = (
  field: StippleField,
  x: number,
  y: number,
  guess: number
) => {
  const { binSize, binColumns, binRows, points } = field;
  const nearest: Nearest = {
    distance:
      guess >= 0
        ? ((points[guess * 2] ?? 0) - x) ** 2 +
          ((points[guess * 2 + 1] ?? 0) - y) ** 2
        : Number.POSITIVE_INFINITY,
    point: guess,
  };
  const column = Math.min(Math.floor(x / binSize), binColumns - 1);
  const row = Math.min(Math.floor(y / binSize), binRows - 1);
  const maxRing = Math.max(binColumns, binRows);
  for (let ring = 0; ring <= maxRing; ring += 1) {
    const reach = (ring - 1) * binSize;
    if (ring > 1 && nearest.distance <= reach * reach) {
      break;
    }
    scanRing(field, column, row, ring, x, y, nearest);
  }
  return nearest.point;
};

const finishIteration = (field: StippleField) => {
  const { count, points, sums } = field;
  let moved = 0;
  for (let point = 0; point < count; point += 1) {
    const mass = sums[point * 3] ?? 0;
    if (mass <= 0) {
      samplePoint(field, points, point);
      continue;
    }
    const targetX = (sums[point * 3 + 1] ?? 0) / mass;
    const targetY = (sums[point * 3 + 2] ?? 0) / mass;
    moved += Math.hypot(
      targetX - (points[point * 2] ?? 0),
      targetY - (points[point * 2 + 1] ?? 0)
    );
    points[point * 2] = targetX;
    points[point * 2 + 1] = targetY;
  }
  sums.fill(0);
  field.movement = moved / Math.max(count, 1);
  field.iterations += 1;
  field.calmIterations =
    field.movement < settledShare * field.binSize
      ? field.calmIterations + 1
      : 0;
  field.row = 0;
  rebuildBins(field);
};

export const isStippleSettled = (field: StippleField) =>
  field.calmIterations >= calmToSettle;

export const relaxStipple = (field: StippleField, hasTime: () => boolean) => {
  const { width, height, weights, sums } = field;
  while (field.row < height && hasTime()) {
    const y = field.row + 0.5;
    let guess = -1;
    for (let column = 0; column < width; column += 1) {
      const weight = weights[field.row * width + column] ?? 0;
      if (weight < weightFloor) {
        continue;
      }
      const x = column + 0.5;
      guess = nearestPoint(field, x, y, guess);
      sums[guess * 3] = (sums[guess * 3] ?? 0) + weight;
      sums[guess * 3 + 1] = (sums[guess * 3 + 1] ?? 0) + weight * x;
      sums[guess * 3 + 2] = (sums[guess * 3 + 2] ?? 0) + weight * y;
    }
    field.row += 1;
  }
  if (field.row >= height) {
    finishIteration(field);
    return true;
  }
  return false;
};

export const stirStipple = (
  field: StippleField,
  x: number,
  y: number,
  pushX: number,
  pushY: number,
  radius: number
) => {
  const { count, points } = field;
  const reachSquared = radius * radius;
  let touched = false;
  for (let point = 0; point < count; point += 1) {
    const offsetX = (points[point * 2] ?? 0) - x;
    const offsetY = (points[point * 2 + 1] ?? 0) - y;
    const distanceSquared = offsetX * offsetX + offsetY * offsetY;
    if (distanceSquared >= reachSquared) {
      continue;
    }
    const falloff = (1 - distanceSquared / reachSquared) ** 2;
    const nextX = x + offsetX + (pushX - offsetY * swirlRate) * falloff;
    const nextY = y + offsetY + (pushY + offsetX * swirlRate) * falloff;
    points[point * 2] = Math.min(Math.max(nextX, 0), field.width - 0.01);
    points[point * 2 + 1] = Math.min(Math.max(nextY, 0), field.height - 0.01);
    touched = true;
  }
  if (touched) {
    rebuildBins(field);
    field.row = 0;
    field.sums.fill(0);
    unsettle(field);
  }
  return touched;
};

export const dotRadiusFor = (field: StippleField) =>
  Math.sqrt(
    (0.42 * field.weightSum) /
      (Math.PI * Math.max(field.count, 1) * Math.max(field.weightPeak, 1e-6))
  );

export const weightAt = (field: StippleField, x: number, y: number) =>
  (field.weights[
    Math.min(Math.floor(y), field.height - 1) * field.width +
      Math.min(Math.floor(x), field.width - 1)
  ] ?? 0) / Math.max(field.weightPeak, 1e-6);

const cellsPerDot = 20;
const minCells = 30_000;
const maxCells = 140_000;

export const stippleGridFor = (
  stage: { width: number; height: number },
  count: number
) => {
  const cells = Math.min(Math.max(count * cellsPerDot, minCells), maxCells);
  const cell = Math.max(1, Math.sqrt((stage.width * stage.height) / cells));
  return {
    cell,
    columns: Math.max(1, Math.round(stage.width / cell)),
    rows: Math.max(1, Math.round(stage.height / cell)),
  };
};
