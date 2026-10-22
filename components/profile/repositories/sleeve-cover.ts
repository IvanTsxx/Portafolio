import { seededRandom } from "@/components/profile/repositories/seeded-random";

export const COVER_CELLS = 32;

const TAU = Math.PI * 2;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;
const BAYER_SIDE = 4;

type Field = (x: number, y: number) => number;

interface Seed {
  angle: number;
  centerX: number;
  centerY: number;
  frequency: number;
  phase: number;
}

export const hashOf = (text: string) =>
  [...text].reduce(
    (total, character, index) =>
      (total * 31 + (character.codePointAt(0) ?? 0) * (index + 7)) %
      2_147_483_647,
    17
  );

const seedOf = (id: string): Seed => {
  const random = seededRandom(hashOf(id));
  return {
    angle: random() * Math.PI,
    centerX: 0.25 + random() * 0.5,
    centerY: 0.25 + random() * 0.5,
    frequency: 1.4 + random() * 2.2,
    phase: random() * TAU,
  };
};

const wave = (value: number) => 0.5 + 0.5 * Math.sin(value);

const distance = (seed: Seed, x: number, y: number) =>
  Math.hypot(x - seed.centerX, y - seed.centerY);

const motifs = {
  bands: (seed: Seed): Field => {
    const cos = Math.cos(seed.angle);
    const sin = Math.sin(seed.angle);
    return (x, y) =>
      wave(seed.frequency * TAU * (x * cos + y * sin) + seed.phase);
  },
  checker:
    (seed: Seed): Field =>
    (x, y) =>
      wave(seed.frequency * 3 * x + seed.phase) *
      wave(seed.frequency * 3 * y - seed.phase),
  rings:
    (seed: Seed): Field =>
    (x, y) =>
      wave(seed.frequency * TAU * distance(seed, x, y) * 1.4 + seed.phase),
  sun:
    (seed: Seed): Field =>
    (x, y) =>
      Math.max(0, 1 - distance(seed, x, y) * (1.2 + seed.frequency * 0.2)),
} as const satisfies Record<string, (seed: Seed) => Field>;

type Motif = keyof typeof motifs;

const motifOrder = [
  "bands",
  "checker",
  "rings",
  "sun",
] as const satisfies readonly Motif[];

const languageMotifs = new Map<string, Motif>([
  ["Go", "sun"],
  ["JavaScript", "checker"],
  ["Python", "bands"],
  ["Rust", "checker"],
  ["TypeScript", "rings"],
]);

const motifOf = (language: string): Motif =>
  languageMotifs.get(language) ??
  motifOrder[hashOf(language) % motifOrder.length] ??
  "sun";

export const thresholdAt = (column: number, row: number) =>
  ((BAYER[(row % BAYER_SIDE) * BAYER_SIDE + (column % BAYER_SIDE)] ?? 8) +
    0.5) /
  BAYER.length;

export const sleeveCoverOf = (id: string, language: string) => {
  const seed = seedOf(id);
  const field = motifs[motifOf(language)](seed);
  const fade = seedOf(`${id}#fade`);
  let path = "";
  for (let row = 0; row < COVER_CELLS; row += 1) {
    let runStart = -1;
    for (let column = 0; column <= COVER_CELLS; column += 1) {
      const x = (column + 0.5) / COVER_CELLS;
      const y = (row + 0.5) / COVER_CELLS;
      const tone =
        column < COVER_CELLS
          ? field(x, y) * (0.55 + 0.45 * wave(fade.phase + y * TAU * 0.5))
          : 0;
      const isInk = column < COVER_CELLS && tone > thresholdAt(column, row);
      if (isInk && runStart < 0) {
        runStart = column;
      } else if (!isInk && runStart >= 0) {
        path += `M${runStart} ${row}h${column - runStart}v1h-${column - runStart}z`;
        runStart = -1;
      }
    }
  }
  return path;
};
