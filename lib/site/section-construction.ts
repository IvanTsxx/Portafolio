export type Construction =
  | { phase: "idle" }
  | { phase: "waiting" }
  | { phase: "constructing"; total: number }
  | { phase: "built" };

export type ConstructionEvent =
  | { type: "arm" }
  | { type: "begin"; total: number }
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
  if (state.phase === "idle" && event.type === "arm") {
    return { phase: "waiting" };
  }
  if (state.phase === "waiting" && event.type === "begin") {
    return event.total > 0
      ? { phase: "constructing", total: event.total }
      : built;
  }
  return state;
};

export const buildBudgetSeconds = 0.5;
export const blockBuildSeconds = 0.3;
export const maxStaggerSeconds = 0.04;
export const buildGraceSeconds = 0.3;
export const blockRisePixels = 8;

export const buildStagger = (count: number) =>
  count > 1
    ? Math.min(
        maxStaggerSeconds,
        (buildBudgetSeconds - blockBuildSeconds) / (count - 1)
      )
    : 0;

export const buildSeconds = (count: number) =>
  count > 0 ? (count - 1) * buildStagger(count) + blockBuildSeconds : 0;

export const buildDeadlineSeconds = (count: number) =>
  buildSeconds(count) + buildGraceSeconds;

const foldShare = 0.85;

export const startsHidden = (top: number, viewportHeight: number) =>
  top >= viewportHeight * foldShare;
