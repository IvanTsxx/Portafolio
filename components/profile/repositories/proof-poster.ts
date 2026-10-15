import { seededRandom } from "@/components/lab/experiments/stipple/stipple-field";

export const POSTER_WIDTH = 100;
export const POSTER_HEIGHT = 125;
export const POSTER_TRIM = 10;

const INK_COLUMNS = 16;
const TINT_COLUMNS = 8;
const MIN_MARK = 0.5;
const TAU = Math.PI * 2;

type Field = (x: number, y: number) => number;

interface Seed {
  angle: number;
  centerX: number;
  centerY: number;
  frequency: number;
  phase: number;
}

export interface ProofPoster {
  ink: string;
  marks: string;
  tint: string;
}

const hashOf = (text: string) =>
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
    centerX: 0.2 + random() * 0.6,
    centerY: 0.2 + random() * 0.6,
    frequency: 1.6 + random() * 2.4,
    phase: random() * TAU,
  };
};

const wave = (value: number) => 0.5 + 0.5 * Math.sin(value);

const distance = (seed: Seed, x: number, y: number) =>
  Math.hypot(x - seed.centerX, (y - seed.centerY) * 1.25);

const motifs = {
  bands:
    (seed: Seed): Field =>
    (x, y) =>
      wave(
        seed.frequency *
          TAU *
          (x * Math.cos(seed.angle) + y * Math.sin(seed.angle)) +
          seed.phase
      ),
  checker:
    (seed: Seed): Field =>
    (x, y) =>
      wave(seed.frequency * 4 * x + seed.phase) *
      wave(seed.frequency * 4 * y - seed.phase),
  rings:
    (seed: Seed): Field =>
    (x, y) =>
      wave(seed.frequency * TAU * distance(seed, x, y) * 1.6 + seed.phase),
  sun:
    (seed: Seed): Field =>
    (x, y) =>
      Math.max(0, 1 - distance(seed, x, y) * (1.1 + seed.frequency * 0.2)),
} as const satisfies Record<string, (seed: Seed) => Field>;

type Motif = keyof typeof motifs;

const motifOrder = [
  "bands",
  "checker",
  "rings",
  "sun",
] as const satisfies readonly Motif[];

const languageMotifs = new Map<string, Motif>([
  ["JavaScript", "checker"],
  ["Python", "bands"],
  ["TypeScript", "rings"],
]);

const motifOf = (language: string): Motif =>
  languageMotifs.get(language) ??
  motifOrder[hashOf(language) % motifOrder.length] ??
  "sun";

const trimmed = (value: number) => String(Math.round(value * 10) / 10);

const inkPlate = (field: Field) => {
  const span = POSTER_WIDTH - POSTER_TRIM * 2;
  const cell = span / INK_COLUMNS;
  const rows = Math.floor((POSTER_HEIGHT - POSTER_TRIM * 2) / cell);
  let path = "";
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < INK_COLUMNS; column += 1) {
      const tone = field((column + 0.5) / INK_COLUMNS, (row + 0.5) / rows);
      const side = cell * 0.86 * tone ** 0.7;
      if (side >= MIN_MARK) {
        const x = POSTER_TRIM + column * cell + (cell - side) / 2;
        const y = POSTER_TRIM + row * cell + (cell - side) / 2;
        path += `M${trimmed(x)} ${trimmed(y)}h${trimmed(side)}v${trimmed(side)}h-${trimmed(side)}z`;
      }
    }
  }
  return path;
};

const tintPlate = (field: Field) => {
  const span = POSTER_WIDTH - POSTER_TRIM * 2;
  const cell = span / TINT_COLUMNS;
  const rows = Math.floor((POSTER_HEIGHT - POSTER_TRIM * 2) / cell);
  let path = "";
  for (let row = 0; row < rows; row += 1) {
    const shift = row % 2 === 0 ? 0 : cell / 2;
    for (let column = 0; column < TINT_COLUMNS; column += 1) {
      const centerX = POSTER_TRIM + column * cell + cell / 2 + shift;
      const centerY = POSTER_TRIM + row * cell + cell / 2;
      const tone = field(
        (centerX - POSTER_TRIM) / span,
        (centerY - POSTER_TRIM) / (rows * cell)
      );
      const radius = (cell / 2) * 0.96 * Math.sqrt(tone);
      if (
        radius >= MIN_MARK &&
        centerX + radius <= POSTER_WIDTH - POSTER_TRIM
      ) {
        const r = trimmed(radius);
        const d = trimmed(radius * 2);
        path += `M${trimmed(centerX - radius)} ${trimmed(centerY)}a${r} ${r} 0 1 0 ${d} 0a${r} ${r} 0 1 0 -${d} 0`;
      }
    }
  }
  return path;
};

const MARK_INSET = 4;
const MARK_RADIUS = 1.6;
const MARK_ARM = 3;

const registrationMarks = () =>
  [
    [MARK_INSET, MARK_INSET],
    [POSTER_WIDTH - MARK_INSET, MARK_INSET],
    [MARK_INSET, POSTER_HEIGHT - MARK_INSET],
    [POSTER_WIDTH - MARK_INSET, POSTER_HEIGHT - MARK_INSET],
  ]
    .map(
      ([x = 0, y = 0]) =>
        `M${x - MARK_ARM} ${y}h${MARK_ARM * 2}M${x} ${y - MARK_ARM}v${MARK_ARM * 2}M${x - MARK_RADIUS} ${y}a${MARK_RADIUS} ${MARK_RADIUS} 0 1 0 ${MARK_RADIUS * 2} 0a${MARK_RADIUS} ${MARK_RADIUS} 0 1 0 -${MARK_RADIUS * 2} 0`
    )
    .join("");

export const proofPosterOf = (id: string, language: string): ProofPoster => {
  const seed = seedOf(id);
  const counterSeed = seedOf(`${id}#tint`);
  return {
    ink: inkPlate(motifs[motifOf(language)](seed)),
    marks: registrationMarks(),
    tint: tintPlate(motifs.sun(counterSeed)),
  };
};
