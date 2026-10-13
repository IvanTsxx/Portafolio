export type ConstructionSource = "companion" | "self";

export type Construction =
  | { phase: "idle" }
  | { phase: "waiting"; total: number }
  | {
      phase: "constructing";
      placed: number;
      source: ConstructionSource;
      total: number;
    }
  | { phase: "built" };

export type ConstructionEvent =
  | { type: "arm"; total: number }
  | { type: "begin"; source: ConstructionSource }
  | { type: "place"; count: number }
  | { type: "handoff" }
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
      if (event.type !== "arm") {
        return state;
      }
      return event.total > 0 ? { phase: "waiting", total: event.total } : built;
    }
    case "waiting": {
      if (event.type !== "begin") {
        return state;
      }
      return {
        phase: "constructing",
        placed: 0,
        source: event.source,
        total: state.total,
      };
    }
    case "constructing": {
      if (event.type === "handoff") {
        return { ...state, source: "self" };
      }
      if (event.type !== "place") {
        return state;
      }
      const placed = state.placed + event.count;
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

export const maxCompanionBeats = 3;

export const blocksForBeat = (placed: number, total: number) => {
  const beats = Math.min(total, maxCompanionBeats);
  for (let beat = 1; beat <= beats; beat += 1) {
    const end = Math.floor((beat * total) / beats);
    if (end > placed) {
      return end - placed;
    }
  }
  return 0;
};
