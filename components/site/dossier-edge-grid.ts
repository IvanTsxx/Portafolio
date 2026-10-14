import { BAYER_4, fade, fbm } from "./hero-field-grid";

export const EDGE_DITHER_COLUMNS = 10;
export const EDGE_DITHER_CELL = 4;
export const EDGE_HOLE_PITCH = 28;
export const EDGE_HOLE_X = 20;
export const EDGE_HOLE_RADIUS = 5;

const EDGE_PEAK_DENSITY = 0.7;
const NOISE_SCALE = 12;
const EDGE_SEED = 4127;
const HOLE_CLEARANCE = 2;
const TONER_SPREAD = 5;
const TONER_STRENGTH = 0.9;
const INWARD_FADE = 0.85;
const BAND_UNDER_TONER = 0.6;

type EdgeDensity = (column: number, row: number, rows: number) => number;

export interface EdgeDitherTile {
  density: EdgeDensity;
  rows: number;
}

const tileableRelief = (column: number, row: number, rows: number) => {
  const x = column / NOISE_SCALE;
  const period = rows / NOISE_SCALE;
  const y = row / NOISE_SCALE;
  const blend = row / rows;
  const grain =
    fbm(x, y, EDGE_SEED) * (1 - blend) + fbm(x, y - period, EDGE_SEED) * blend;
  return Math.min(1, Math.max(0, (grain - 0.42) * 2.4 + 0.5));
};

const sheetEdgeBand: EdgeDensity = (column, row, rows) =>
  (1 - fade(0, 0.85, column / EDGE_DITHER_COLUMNS)) *
  EDGE_PEAK_DENSITY *
  tileableRelief(column, row, rows);

export const edgeHoleCenter = (at: number) =>
  EDGE_HOLE_PITCH / 2 +
  Math.max(0, Math.round((at - EDGE_HOLE_PITCH / 2) / EDGE_HOLE_PITCH)) *
    EDGE_HOLE_PITCH;

export const edgeHoleDistance = (column: number, row: number) => {
  const y = (row + 0.5) * EDGE_DITHER_CELL;
  return Math.hypot(
    (column + 0.5) * EDGE_DITHER_CELL - EDGE_HOLE_X,
    y - edgeHoleCenter(y)
  );
};

const tonerAroundHoles: EdgeDensity = (column, row, rows) => {
  const rimGap = edgeHoleDistance(column, row) - EDGE_HOLE_RADIUS;
  if (rimGap < HOLE_CLEARANCE) {
    return 0;
  }
  const band = sheetEdgeBand(column, row, rows) * BAND_UNDER_TONER;
  const inward = column / EDGE_DITHER_COLUMNS;
  const toner =
    TONER_STRENGTH *
    (1 - inward * INWARD_FADE) *
    (0.5 + 0.5 * tileableRelief(column, row, rows)) *
    Math.exp(-(((rimGap - HOLE_CLEARANCE) / TONER_SPREAD) ** 2));
  return band + (1 - band) * toner;
};

export const boundTile: EdgeDitherTile = {
  density: tonerAroundHoles,
  rows: (EDGE_HOLE_PITCH / EDGE_DITHER_CELL) * 36,
};

export const edgeDitherCells = ({ density, rows }: EdgeDitherTile) => {
  const cells = new Uint8Array(EDGE_DITHER_COLUMNS * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < EDGE_DITHER_COLUMNS; column += 1) {
      const threshold =
        ((BAYER_4[(row % 4) * 4 + (column % 4)] ?? 0) + 0.5) / 16;
      if (density(column, row, rows) > threshold) {
        cells[row * EDGE_DITHER_COLUMNS + column] = 1;
      }
    }
  }
  return cells;
};

export const edgeDitherDotsPath = (cells: Uint8Array, dot: number) => {
  const inset = (EDGE_DITHER_CELL - dot) / 2;
  const rows = cells.length / EDGE_DITHER_COLUMNS;
  const commands: string[] = [];
  for (let row = 0; row < rows; row += 1) {
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
