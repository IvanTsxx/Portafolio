export const HERO_FIELD_COLUMNS = 192;
export const HERO_FIELD_ROWS = 72;
export const HERO_FIELD_CELLS = HERO_FIELD_COLUMNS * HERO_FIELD_ROWS;
export const PEAK_DENSITY = 0.62;

export const BAYER_4 = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
] as const;

export interface HeroFieldBase {
  envelope: Float32Array;
  relief: Float32Array;
  seed: number;
  thresholds: Float32Array;
}

const seedOf = (text: string) =>
  [...text].reduce(
    (total, character, index) =>
      (total * 31 + (character.codePointAt(0) ?? 0) * (index + 7)) % 9973,
    17
  );

const lattice = (x: number, y: number, seed: number) => {
  const wave = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43_758.5453;
  return wave - Math.floor(wave);
};

const smooth = (value: number) => value * value * (3 - 2 * value);

const valueNoise = (x: number, y: number, seed: number) => {
  const baseX = Math.floor(x);
  const baseY = Math.floor(y);
  const blendX = smooth(x - baseX);
  const blendY = smooth(y - baseY);
  const top =
    lattice(baseX, baseY, seed) +
    (lattice(baseX + 1, baseY, seed) - lattice(baseX, baseY, seed)) * blendX;
  const bottom =
    lattice(baseX, baseY + 1, seed) +
    (lattice(baseX + 1, baseY + 1, seed) - lattice(baseX, baseY + 1, seed)) *
      blendX;
  return top + (bottom - top) * blendY;
};

export const fbm = (x: number, y: number, seed: number) =>
  0.55 * valueNoise(x, y, seed) +
  0.3 * valueNoise(x * 2.1 + 17, y * 2.1 + 9, seed) +
  0.15 * valueNoise(x * 4.3 + 5, y * 4.3 + 31, seed);

export const fade = (edge0: number, edge1: number, value: number) => {
  const progress = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return smooth(progress);
};

export const heroFieldBase = (key: string): HeroFieldBase => {
  const seed = seedOf(key);
  const envelope = new Float32Array(HERO_FIELD_CELLS);
  const relief = new Float32Array(HERO_FIELD_CELLS);
  const thresholds = new Float32Array(HERO_FIELD_CELLS);
  for (let row = 0; row < HERO_FIELD_ROWS; row += 1) {
    const bottom = 1 - fade(0.05, 0.8, row / HERO_FIELD_ROWS);
    for (let column = 0; column < HERO_FIELD_COLUMNS; column += 1) {
      const index = row * HERO_FIELD_COLUMNS + column;
      const textSide = fade(0.28, 0.92, column / HERO_FIELD_COLUMNS);
      const grain = fbm(column / 14, row / 14, seed);
      envelope[index] = textSide * bottom * PEAK_DENSITY;
      relief[index] = Math.min(1, Math.max(0, (grain - 0.42) * 2.4 + 0.4));
      thresholds[index] =
        ((BAYER_4[(row % 4) * 4 + (column % 4)] ?? 0) + 0.5) / 16;
    }
  }
  return { envelope, relief, seed, thresholds };
};

export const heroFieldCells = ({
  envelope,
  relief,
  thresholds,
}: HeroFieldBase) => {
  const cells = new Uint8Array(HERO_FIELD_CELLS);
  for (let index = 0; index < HERO_FIELD_CELLS; index += 1) {
    if (
      (relief[index] ?? 0) * (envelope[index] ?? 0) >
      (thresholds[index] ?? 1)
    ) {
      cells[index] = 1;
    }
  }
  return cells;
};

export const heroFieldDotPath = (cells: Uint8Array) => {
  const commands: string[] = [];
  for (const [index, cell] of cells.entries()) {
    if (cell) {
      const column = index % HERO_FIELD_COLUMNS;
      const row = Math.floor(index / HERO_FIELD_COLUMNS);
      commands.push(`M${column + 0.25} ${row + 0.25}h0.5v0.5h-0.5z`);
    }
  }
  return commands.join("");
};
