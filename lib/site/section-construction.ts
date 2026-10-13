export type Construction =
  | { phase: "idle" }
  | { phase: "waiting" }
  | { phase: "constructing"; placed: number; total: number }
  | { phase: "built" };

export type ConstructionEvent =
  | { type: "arm" }
  | { type: "begin"; total: number }
  | { type: "place" }
  | { type: "finish" };

export type ConstructionPhase = Construction["phase"];

export const idleConstruction: Construction = { phase: "idle" };

const built: Construction = { phase: "built" };

export const advanceConstruction = (
  state: Construction,
  event: ConstructionEvent
): Construction => {
  if (event.type === "finish") {
    return built;
  }
  switch (state.phase) {
    case "idle": {
      return event.type === "arm" ? { phase: "waiting" } : state;
    }
    case "waiting": {
      if (event.type !== "begin") {
        return state;
      }
      return event.total > 0
        ? { phase: "constructing", placed: 0, total: event.total }
        : built;
    }
    case "constructing": {
      if (event.type !== "place") {
        return state;
      }
      const placed = state.placed + 1;
      return placed >= state.total ? built : { ...state, placed };
    }
    case "built": {
      return state;
    }
    default: {
      return state;
    }
  }
};

export interface BuildBlock {
  compact: boolean;
  height: number;
  parent: number;
}

export type BuildTool = "gantry" | "sweep";

export interface BlockTiming {
  frame: number;
  layers: number;
  offset: number;
  pass: number;
  pause: number;
  print: number;
  settle: number;
  start: number;
  tool: BuildTool;
}

type Stage = Omit<BlockTiming, "offset" | "pass" | "start">;

const targetSeconds = 4.8;
const minPassGap = 0.35;
const maxPassGap = 0.9;
const sweepOffset = 0.09;
const minPrint = 1.2;
const maxPrint = 2;
const printPerPixel = 1 / 450;
const layerPixels = 48;
const minLayers = 4;
const maxLayers = 9;

const sweepStage: Stage = {
  frame: 0.32,
  layers: 2,
  pause: 0.12,
  print: 0.44,
  settle: 0.5,
  tool: "sweep",
};

const clamp = (low: number, high: number, value: number) =>
  Math.min(high, Math.max(low, value));

const stageFor = (block: BuildBlock): Stage =>
  block.compact
    ? sweepStage
    : {
        frame: 0.5,
        layers: Math.round(
          clamp(minLayers, maxLayers, block.height / layerPixels)
        ),
        pause: 0.3,
        print: clamp(minPrint, maxPrint, 0.9 + block.height * printPerPixel),
        settle: 0.8,
        tool: "gantry",
      };

const stageSeconds = (stage: Stage) =>
  stage.frame + stage.pause + stage.print + stage.settle;

export const constructionSchedule = (
  blocks: readonly BuildBlock[]
): BlockTiming[] => {
  const placed: Omit<BlockTiming, "start">[] = [];
  const sweeps = new Map<number, { offset: number; pass: number }>();
  let pass = -1;
  for (const block of blocks) {
    const sweep = block.compact ? sweeps.get(block.parent) : undefined;
    if (sweep) {
      sweep.offset += sweepOffset;
      placed.push({ ...stageFor(block), ...sweep });
      continue;
    }
    pass += 1;
    if (block.compact) {
      sweeps.set(block.parent, { offset: 0, pass });
    }
    placed.push({ ...stageFor(block), offset: 0, pass });
  }
  const spans: number[] = [];
  let lastSeconds = 0;
  for (const block of placed) {
    spans[block.pass] = Math.max(spans[block.pass] ?? 0, block.offset);
    if (block.pass === pass) {
      lastSeconds = Math.max(lastSeconds, block.offset + stageSeconds(block));
    }
  }
  let leadSpans = 0;
  for (const span of spans.slice(0, -1)) {
    leadSpans += span;
  }
  const gap =
    pass > 0
      ? clamp(
          minPassGap,
          maxPassGap,
          (targetSeconds - lastSeconds - leadSpans) / pass
        )
      : 0;
  let cursor = 0;
  const starts = spans.map((span) => {
    const start = cursor;
    cursor += span + gap;
    return start;
  });
  return placed.map((block) => ({
    ...block,
    start: (starts[block.pass] ?? 0) + block.offset,
  }));
};

export const passGapSeconds = minPassGap;

export const scheduleSeconds = (schedule: readonly BlockTiming[]) =>
  Math.max(0, ...schedule.map((block) => block.start + stageSeconds(block)));
