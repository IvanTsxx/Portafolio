import { BAYER_4, cellsPath, fade, fbm } from "./hero-field-grid";

export const EDGE_DITHER_COLUMNS = 40;
export const EDGE_DITHER_ROWS = 256;
export const EDGE_DITHER_CELL = 4;

const EDGE_PEAK_DENSITY = 0.5;
const NOISE_SCALE = 12;
const EDGE_SEED = 4127;

const tileableRelief = (column: number, row: number) => {
  const x = column / NOISE_SCALE;
  const period = EDGE_DITHER_ROWS / NOISE_SCALE;
  const y = row / NOISE_SCALE;
  const blend = row / EDGE_DITHER_ROWS;
  const grain =
    fbm(x, y, EDGE_SEED) * (1 - blend) + fbm(x, y - period, EDGE_SEED) * blend;
  return Math.min(1, Math.max(0, (grain - 0.42) * 2.4 + 0.4));
};

export const edgeDitherCells = () => {
  const cells = new Uint8Array(EDGE_DITHER_COLUMNS * EDGE_DITHER_ROWS);
  for (let row = 0; row < EDGE_DITHER_ROWS; row += 1) {
    for (let column = 0; column < EDGE_DITHER_COLUMNS; column += 1) {
      const outerSide = 1 - fade(0, 0.92, column / EDGE_DITHER_COLUMNS);
      const density =
        outerSide * EDGE_PEAK_DENSITY * tileableRelief(column, row);
      const threshold =
        ((BAYER_4[(row % 4) * 4 + (column % 4)] ?? 0) + 0.5) / 16;
      if (density > threshold) {
        cells[row * EDGE_DITHER_COLUMNS + column] = 1;
      }
    }
  }
  return cells;
};

export const edgeDitherPath = () =>
  cellsPath(edgeDitherCells(), EDGE_DITHER_COLUMNS, EDGE_DITHER_ROWS);
