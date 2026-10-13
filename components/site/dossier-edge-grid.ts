import { BAYER_4, fade, fbm } from "./hero-field-grid";

export const EDGE_DITHER_COLUMNS = 10;
export const EDGE_DITHER_ROWS = 256;
export const EDGE_DITHER_CELL = 4;

const EDGE_PEAK_DENSITY = 0.7;
const NOISE_SCALE = 12;
const EDGE_SEED = 4127;

const tileableRelief = (column: number, row: number) => {
  const x = column / NOISE_SCALE;
  const period = EDGE_DITHER_ROWS / NOISE_SCALE;
  const y = row / NOISE_SCALE;
  const blend = row / EDGE_DITHER_ROWS;
  const grain =
    fbm(x, y, EDGE_SEED) * (1 - blend) + fbm(x, y - period, EDGE_SEED) * blend;
  return Math.min(1, Math.max(0, (grain - 0.42) * 2.4 + 0.5));
};

export const edgeDitherCells = () => {
  const cells = new Uint8Array(EDGE_DITHER_COLUMNS * EDGE_DITHER_ROWS);
  for (let row = 0; row < EDGE_DITHER_ROWS; row += 1) {
    for (let column = 0; column < EDGE_DITHER_COLUMNS; column += 1) {
      const sheetEdge = 1 - fade(0, 0.85, column / EDGE_DITHER_COLUMNS);
      const density =
        sheetEdge * EDGE_PEAK_DENSITY * tileableRelief(column, row);
      const threshold =
        ((BAYER_4[(row % 4) * 4 + (column % 4)] ?? 0) + 0.5) / 16;
      if (density > threshold) {
        cells[row * EDGE_DITHER_COLUMNS + column] = 1;
      }
    }
  }
  return cells;
};

export const edgeDitherDotsPath = (cells: Uint8Array, dot: number) => {
  const inset = (EDGE_DITHER_CELL - dot) / 2;
  const commands: string[] = [];
  for (let row = 0; row < EDGE_DITHER_ROWS; row += 1) {
    for (let column = 0; column < EDGE_DITHER_COLUMNS; column += 1) {
      if (cells[row * EDGE_DITHER_COLUMNS + column]) {
        commands.push(
          `M${column * EDGE_DITHER_CELL + inset} ${row * EDGE_DITHER_CELL + inset}h${dot}v${dot}h${-dot}z`
        );
      }
    }
  }
  return commands.join("");
};
