import { describe, expect, test } from "bun:test";

import {
  EDGE_DITHER_COLUMNS,
  EDGE_DITHER_ROWS,
  edgeDitherCells,
  edgeDitherDotsPath,
} from "./dossier-edge-grid";

const inkInColumns = (cells: Uint8Array, from: number, to: number) => {
  let total = 0;
  for (let row = 0; row < EDGE_DITHER_ROWS; row += 1) {
    for (let column = from; column < to; column += 1) {
      total += cells[row * EDGE_DITHER_COLUMNS + column] ?? 0;
    }
  }
  return total / (EDGE_DITHER_ROWS * (to - from));
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

describe("edge dither tile", () => {
  const cells = edgeDitherCells();

  test("ink gathers at the sheet edge and clears before the content", () => {
    const outer = inkInColumns(cells, 0, 3);
    const inner = inkInColumns(
      cells,
      EDGE_DITHER_COLUMNS - 1,
      EDGE_DITHER_COLUMNS
    );
    expect(outer).toBeGreaterThan(0.15);
    expect(inner).toBe(0);
  });

  test("the tile repeats without a density seam", () => {
    const window = 8;
    const steps = Array.from(
      { length: EDGE_DITHER_ROWS / window - 1 },
      (_, index) =>
        Math.abs(
          inkInRows(cells, index * window, (index + 1) * window) -
            inkInRows(cells, (index + 1) * window, (index + 2) * window)
        )
    );
    const wrap = Math.abs(
      inkInRows(cells, EDGE_DITHER_ROWS - window, EDGE_DITHER_ROWS) -
        inkInRows(cells, 0, window)
    );
    expect(wrap).toBeLessThanOrEqual(Math.max(...steps));
  });

  test("the swollen dots stay small enough to inline", () => {
    expect(edgeDitherDotsPath(cells, 3).length).toBeLessThan(24_000);
  });
});
