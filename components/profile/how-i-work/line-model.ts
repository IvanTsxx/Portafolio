export const STATION_COUNT = 6;
export const DWELL_S = 2.4;
export const INDEX_S = 1.1;
export const SEEK_SPEED = 2.4;
export const TURN_DEGREES = 360 / STATION_COUNT;

export type Phase = "dwell" | "index";

export interface Line {
  phase: Phase;
  t: number;
  turns: number;
}

export interface Stroke {
  down: number;
  hit: number;
  up: number;
}

export const STROKES: readonly Stroke[] = [
  { down: 0.06, hit: 0.36, up: 0.7 },
  { down: 0.1, hit: 0.42, up: 0.8 },
  { down: 0.16, hit: 0.32, up: 0.52 },
  { down: 0.08, hit: 0.44, up: 0.86 },
  { down: 0.14, hit: 0.38, up: 0.78 },
  { down: 0.12, hit: 0.3, up: 0.5 },
];

export const MERGE = { from: 0.58, to: 0.92 } as const;

export const PIN_SHARE = 0.16;

export const restLine: Line = { phase: "dwell", t: 1, turns: 0 };

export const wrap = (value: number) =>
  ((value % STATION_COUNT) + STATION_COUNT) % STATION_COUNT;

export const smooth = (from: number, to: number, value: number) => {
  const share = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return share * share * (3 - 2 * share);
};

export const positionOf = (nest: number, turns: number) => wrap(nest + turns);

const FALLBACK_STROKE: Stroke = { down: 0.1, hit: 0.4, up: 0.8 };

const strokeOf = (station: number) => STROKES[wrap(station)] ?? FALLBACK_STROKE;

export const travelAt = (station: number, t: number) => {
  const { down, hit, up } = strokeOf(station);
  return smooth(down, hit, t) * (1 - smooth(hit, up, t));
};

export const hitOf = (station: number) => strokeOf(station).hit;

export const turnShare = (line: Line) =>
  line.phase === "index" ? smooth(PIN_SHARE, 1 - PIN_SHARE, line.t) : 0;

export const pinShare = (line: Line) =>
  line.phase === "index"
    ? smooth(0, PIN_SHARE, line.t) * (1 - smooth(1 - PIN_SHARE, 1, line.t))
    : 0;

export const tableTurns = (line: Line) => line.turns + turnShare(line);

export interface NestView {
  alpha: number;
  lift: number;
  stage: number;
}

const EMPTY: NestView = { alpha: 0, lift: 0, stage: -1 };

export const MERGE_LIFT = 12;

export const nestView = (nest: number, line: Line): NestView => {
  const position = positionOf(nest, line.turns);
  const last = STATION_COUNT - 1;
  if (line.phase === "index") {
    return position === last ? EMPTY : { alpha: 1, lift: 0, stage: position };
  }
  const isWorked = line.t >= hitOf(position);
  if (position === 0) {
    return isWorked ? { alpha: 1, lift: 0, stage: 0 } : EMPTY;
  }
  if (position === last && isWorked) {
    const merged = smooth(MERGE.from, MERGE.to, line.t);
    return merged >= 1
      ? EMPTY
      : { alpha: 1 - merged, lift: merged * MERGE_LIFT, stage: last };
  }
  return { alpha: 1, lift: 0, stage: isWorked ? position : position - 1 };
};

export const carriedAlpha = (line: Line) => {
  if (line.phase === "index") {
    return smooth(0, 0.4, line.t);
  }
  return line.t < hitOf(0) ? 1 : 0;
};

export const watchedStep = (line: Line, watched: number) =>
  positionOf(watched, line.turns);

export const holdStepOf = (line: Line, watched: number) =>
  line.phase === "dwell"
    ? watchedStep(line, watched)
    : wrap(watchedStep(line, watched) + 1);

export const isSettled = (line: Line, watched: number, stopAt: number) =>
  line.phase === "dwell" &&
  line.t >= 1 &&
  watchedStep(line, watched) === stopAt;

export const advance = (
  line: Line,
  dt: number,
  { stopAt, watched }: { stopAt: number | null; watched: number }
): Line => {
  if (stopAt !== null && isSettled(line, watched, stopAt)) {
    return line;
  }
  const isArriving =
    stopAt !== null &&
    line.phase === "dwell" &&
    watchedStep(line, watched) === stopAt;
  const speed = stopAt === null || isArriving ? 1 : SEEK_SPEED;
  const duration = line.phase === "dwell" ? DWELL_S : INDEX_S;
  const t = line.t + (dt * speed) / duration;
  if (t < 1) {
    return { ...line, t };
  }
  if (isArriving) {
    return { ...line, t: 1 };
  }
  return line.phase === "dwell"
    ? { phase: "index", t: 0, turns: line.turns }
    : { phase: "dwell", t: 0, turns: line.turns + 1 };
};

export const jumpTo = (line: Line, watched: number, step: number): Line => ({
  phase: "dwell",
  t: 1,
  turns: line.turns + wrap(step - watchedStep(line, watched)),
});
