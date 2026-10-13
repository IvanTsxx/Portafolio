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

export interface BlockTiming {
  frame: number;
  layers: number;
  print: number;
  start: number;
}

const frameSeconds = 0.4;
const targetSeconds = 3;
const minStagger = 0.16;
const maxStagger = 0.45;
const minPrint = 0.5;
const maxPrint = 1.1;
const printPerPixel = 1 / 700;
const layerPixels = 14;
const minLayers = 4;
const maxLayers = 28;

const clamp = (low: number, high: number, value: number) =>
  Math.min(high, Math.max(low, value));

export const constructionSchedule = (
  heights: readonly number[]
): BlockTiming[] => {
  const prints = heights.map((height) =>
    clamp(minPrint, maxPrint, 0.4 + height * printPerPixel)
  );
  const longest = Math.max(minPrint, ...prints);
  const stagger =
    heights.length > 1
      ? clamp(
          minStagger,
          maxStagger,
          (targetSeconds - frameSeconds - longest) / (heights.length - 1)
        )
      : 0;
  return heights.map((height, index) => ({
    frame: frameSeconds,
    layers: Math.round(clamp(minLayers, maxLayers, height / layerPixels)),
    print: prints[index] ?? minPrint,
    start: index * stagger,
  }));
};

export const scheduleSeconds = (schedule: readonly BlockTiming[]) =>
  Math.max(
    0,
    ...schedule.map((block) => block.start + block.frame + block.print)
  );
