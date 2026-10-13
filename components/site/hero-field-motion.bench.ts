import { heroFieldBase } from "./hero-field-grid";
import {
  createHeroFieldMotion,
  createLens,
  heroFieldPixels,
  paintHeroField,
} from "./hero-field-motion";
import type { HeroLens } from "./hero-field-motion";

const FRAMES = 600;
const ROUNDS = 7;
const motion = createHeroFieldMotion(heroFieldBase("GH-02"));
const pixels = heroFieldPixels();

const hoverLens: HeroLens = {
  strength: { value: 1, velocity: 0 },
  x: { value: 150, velocity: 40 },
  y: { value: 24, velocity: -20 },
};

const scenarios = {
  ambient: createLens(),
  hover: hoverLens,
} as const;

const runRound = (lens: HeroLens) => {
  let inkCells = 0;
  const durations: number[] = [];
  for (let frame = 0; frame < FRAMES; frame += 1) {
    const time = 10 + frame / 30;
    const start = performance.now();
    paintHeroField(motion, { lens, ramp: 1, time }, pixels, 1);
    durations.push(performance.now() - start);
    for (const pixel of pixels) {
      inkCells += pixel;
    }
  }
  durations.sort((a, b) => a - b);
  return {
    inkCells: inkCells / FRAMES,
    p50: durations[Math.floor(FRAMES * 0.5)] ?? 0,
    p95: durations[Math.floor(FRAMES * 0.95)] ?? 0,
  };
};

for (const lens of Object.values(scenarios)) {
  runRound(lens);
}

const results = new Map<
  string,
  { p50: number[]; p95: number[]; ink: number }
>();
for (let round = 0; round < ROUNDS; round += 1) {
  for (const [name, lens] of Object.entries(scenarios)) {
    const { inkCells, p50, p95 } = runRound(lens);
    const entry = results.get(name) ?? { ink: inkCells, p50: [], p95: [] };
    entry.p50.push(p50);
    entry.p95.push(p95);
    results.set(name, entry);
  }
}

const median = (values: number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;
const format = (value: number) => `${(value * 1000).toFixed(0)}µs`;

for (const [name, { ink, p50, p95 }] of results) {
  console.log(
    `${name}: p50 ${format(median(p50))} (range ${format(Math.min(...p50))} to ${format(Math.max(...p50))}), p95 ${format(median(p95))}, ${ROUNDS} rounds of ${FRAMES} frames, ${ink.toFixed(0)} ink cells per frame`
  );
}
