import {
  formCenter,
  formRadius,
  groundInk,
  posterLight,
  smoothstep,
  sphereInk,
} from "@/components/lab/source/form-tone";

export interface HeightField {
  columns: number;
  rows: number;
  values: Float32Array;
}

export type Segment = readonly [number, number, number, number];

export const reliefBand = 0.1;

export const formHeight = (x: number, y: number) => {
  const offsetX = x - formCenter.x;
  const offsetY = y - formCenter.y;
  const distance = Math.hypot(offsetX, offsetY);
  const ground = 1 - groundInk(x, y, posterLight);
  const onForm = smoothstep(formRadius, formRadius - reliefBand, distance);
  if (onForm === 0) {
    return ground;
  }
  const depth = Math.sqrt(formRadius ** 2 - distance ** 2);
  const sphere = 1 - sphereInk(offsetX, offsetY, depth, posterLight);
  return ground + (sphere - ground) * onForm;
};

export const metresPerUnit = 1000;

export const elevationMetres = (height: number) =>
  Math.round(height * metresPerUnit);

export const contourInterval = (levels: number) =>
  Math.round(metresPerUnit / levels);

export const sampleField = (
  columns: number,
  rows: number,
  heightAt: (column: number, row: number) => number
): HeightField => {
  const values = new Float32Array(columns * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      values[row * columns + column] = heightAt(column, row);
    }
  }
  return { columns, rows, values };
};

const valueAt = (field: HeightField, column: number, row: number) =>
  field.values[row * field.columns + column] ?? 0;

const crossing = (from: number, to: number, level: number) =>
  from === to ? 0.5 : (level - from) / (to - from);

const edgePoint = (
  edge: number,
  column: number,
  row: number,
  corners: readonly [number, number, number, number],
  level: number
): readonly [number, number] => {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  if (edge === 0) {
    return [column + crossing(topLeft, topRight, level), row];
  }
  if (edge === 1) {
    return [column + 1, row + crossing(topRight, bottomRight, level)];
  }
  if (edge === 2) {
    return [column + crossing(bottomLeft, bottomRight, level), row + 1];
  }
  return [column, row + crossing(topLeft, bottomLeft, level)];
};

const caseEdges: readonly (readonly (readonly [number, number])[])[] = [
  [],
  [[3, 2]],
  [[2, 1]],
  [[3, 1]],
  [[0, 1]],
  [
    [3, 2],
    [0, 1],
  ],
  [[0, 2]],
  [[3, 0]],
  [[3, 0]],
  [[0, 2]],
  [
    [3, 0],
    [2, 1],
  ],
  [[0, 1]],
  [[3, 1]],
  [[2, 1]],
  [[3, 2]],
  [],
];

const saddleEdges = {
  10: [
    [3, 2],
    [0, 1],
  ],
  5: [
    [3, 0],
    [2, 1],
  ],
} as const;

export const contourSegments = (
  field: HeightField,
  level: number
): Segment[] => {
  const segments: Segment[] = [];
  for (let row = 0; row < field.rows - 1; row += 1) {
    for (let column = 0; column < field.columns - 1; column += 1) {
      const corners = [
        valueAt(field, column, row),
        valueAt(field, column + 1, row),
        valueAt(field, column + 1, row + 1),
        valueAt(field, column, row + 1),
      ] as const;
      const [topLeft, topRight, bottomRight, bottomLeft] = corners;
      const index =
        (topLeft > level ? 8 : 0) +
        (topRight > level ? 4 : 0) +
        (bottomRight > level ? 2 : 0) +
        (bottomLeft > level ? 1 : 0);
      const isSaddle = index === 5 || index === 10;
      const centerIsHigh =
        (topLeft + topRight + bottomRight + bottomLeft) / 4 > level;
      const edges =
        isSaddle && centerIsHigh ? saddleEdges[index] : caseEdges[index];
      for (const [from, to] of edges ?? []) {
        const start = edgePoint(from, column, row, corners, level);
        const end = edgePoint(to, column, row, corners, level);
        segments.push([start[0], start[1], end[0], end[1]]);
      }
    }
  }
  return segments;
};

const pointKey = (x: number, y: number) => `${x.toFixed(5)},${y.toFixed(5)}`;

export const chainSegments = (segments: readonly Segment[]): number[][] => {
  const byEndpoint = new Map<string, number[]>();
  const link = (key: string, index: number) => {
    const list = byEndpoint.get(key) ?? [];
    list.push(index);
    byEndpoint.set(key, list);
  };
  for (const [index, [x1, y1, x2, y2]] of segments.entries()) {
    link(pointKey(x1, y1), index);
    link(pointKey(x2, y2), index);
  }
  const used = new Uint8Array(segments.length);
  const extend = (line: number[], atEnd: boolean) => {
    for (;;) {
      const x = atEnd ? (line.at(-2) ?? 0) : (line[0] ?? 0);
      const y = atEnd ? (line.at(-1) ?? 0) : (line[1] ?? 0);
      const key = pointKey(x, y);
      const index = byEndpoint.get(key)?.find((next) => used[next] === 0);
      const segment = index === undefined ? undefined : segments[index];
      if (index === undefined || !segment) {
        return;
      }
      used[index] = 1;
      const [x1, y1, x2, y2] = segment;
      const [nextX, nextY] = pointKey(x1, y1) === key ? [x2, y2] : [x1, y1];
      if (atEnd) {
        line.push(nextX, nextY);
      } else {
        line.unshift(nextX, nextY);
      }
    }
  };
  const lines: number[][] = [];
  for (const [index, segment] of segments.entries()) {
    if (used[index] === 1) {
      continue;
    }
    used[index] = 1;
    const line = [...segment];
    extend(line, true);
    extend(line, false);
    lines.push(line);
  }
  return lines;
};
