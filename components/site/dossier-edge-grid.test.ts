import { describe, expect, test } from "bun:test";

import {
  EDGE_DITHER_CELL,
  EDGE_DITHER_COLUMNS,
  EDGE_HOLE_PITCH,
  EDGE_HOLE_RADIUS,
  boundTile,
  ditherTile,
  edgeDitherCells,
  edgeDitherDotsPath,
  edgeHoleCenter,
  edgeHoleDistance,
} from "./dossier-edge-grid";

const inkInColumns = (
  cells: Uint8Array,
  rows: number,
  from: number,
  to: number
) => {
  let total = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = from; column < to; column += 1) {
      total += cells[row * EDGE_DITHER_COLUMNS + column] ?? 0;
    }
  }
  return total / (rows * (to - from));
};

const inkInRows = (cells: Uint8Array, from: number, to: number) => {
  let total = 0;
  for (let row = from; row < to; row += 1) {
    for (let column = 0; column < EDGE_DITHER_COLUMNS; column += 1) {
      total += cells[row * EDGE_DITHER_COLUMNS + column] ?? 0;
    }
  }
  return total;
};

const inkWhere = (
  cells: Uint8Array,
  rows: number,
  keep: (distance: number) => boolean
) => {
  let ink = 0;
  let count = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < EDGE_DITHER_COLUMNS; column += 1) {
      if (keep(edgeHoleDistance(column, row))) {
        ink += cells[row * EDGE_DITHER_COLUMNS + column] ?? 0;
        count += 1;
      }
    }
  }
  return { count, density: ink / count, ink };
};

describe.each([
  ["dither", ditherTile],
  ["bound", boundTile],
])("%s tile", (_, tile) => {
  const cells = edgeDitherCells(tile);

  test("ink gathers at the sheet edge and clears before the content", () => {
    const outer = inkInColumns(cells, tile.rows, 0, 3);
    const inner = inkInColumns(
      cells,
      tile.rows,
      EDGE_DITHER_COLUMNS - 1,
      EDGE_DITHER_COLUMNS
    );
    expect(outer).toBeGreaterThan(0.15);
    expect(inner).toBe(0);
  });

  test("the tile repeats without a density seam", () => {
    const window = 8;
    const steps = Array.from({ length: tile.rows / window - 1 }, (__, index) =>
      Math.abs(
        inkInRows(cells, index * window, (index + 1) * window) -
          inkInRows(cells, (index + 1) * window, (index + 2) * window)
      )
    );
    const wrap = Math.abs(
      inkInRows(cells, tile.rows - window, tile.rows) -
        inkInRows(cells, 0, window)
    );
    expect(wrap).toBeLessThanOrEqual(Math.max(...steps));
  });

  test("the swollen dots stay small enough to inline", () => {
    expect(edgeDitherDotsPath(cells, 3.5).length).toBeLessThan(24_000);
  });
});

describe("bound tile", () => {
  const cells = edgeDitherCells(boundTile);

  test("tiles a whole number of holes", () => {
    expect((boundTile.rows * EDGE_DITHER_CELL) % EDGE_HOLE_PITCH).toBe(0);
  });

  test("every hole is punched clean", () => {
    const inside = inkWhere(
      cells,
      boundTile.rows,
      (distance) => distance <= EDGE_HOLE_RADIUS + 1
    );
    expect(inside.count).toBeGreaterThan(0);
    expect(inside.ink).toBe(0);
  });

  test("toner sits denser around the holes than between them", () => {
    const rim = inkWhere(
      cells,
      boundTile.rows,
      (distance) =>
        distance > EDGE_HOLE_RADIUS + 2 && distance < EDGE_HOLE_RADIUS + 6
    );
    const between = inkWhere(
      cells,
      boundTile.rows,
      (distance) => distance > EDGE_HOLE_RADIUS + 10
    );
    expect(rim.density).toBeGreaterThan(between.density * 1.5);
  });
});

test("a press snaps to the nearest hole", () => {
  expect(edgeHoleCenter(0)).toBe(EDGE_HOLE_PITCH / 2);
  expect(edgeHoleCenter(EDGE_HOLE_PITCH * 2 + 3)).toBe(EDGE_HOLE_PITCH * 2.5);
  expect(edgeHoleCenter(EDGE_HOLE_PITCH * 3 - 1)).toBe(EDGE_HOLE_PITCH * 2.5);
});
