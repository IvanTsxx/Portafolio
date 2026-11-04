export const ringLength = 0.3;
export const reprintLength = 0.75;
export const colorHoldLength = 1.1;
export const colorFadeLength = 0.8;
export const blastLength =
  ringLength + reprintLength + colorHoldLength + colorFadeLength;
export const rearmAfter = ringLength + reprintLength;
export const ringReach = 2.2;

export interface BlastFrame {
  ring: number;
  front: number;
  reprint: number;
  color: number;
}

export const idleFrame: BlastFrame = {
  color: 0,
  front: 0,
  reprint: 1,
  ring: 0,
};

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;
const easeOutQuad = (progress: number) => 1 - (1 - progress) ** 2;
const easeInOutCubic = (progress: number) =>
  progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

export const blastFrame = (age: number): BlastFrame => {
  if (!(age >= 0) || age >= blastLength) {
    return idleFrame;
  }
  if (age < ringLength) {
    const progress = age / ringLength;
    return {
      color: 0,
      front: (1 - progress) ** 2,
      reprint: 0,
      ring: ringReach * easeOutCubic(progress),
    };
  }
  const reprintAge = age - ringLength;
  const fadeAge = reprintAge - reprintLength - colorHoldLength;
  return {
    color:
      fadeAge <= 0
        ? 1
        : 1 - easeInOutCubic(Math.min(fadeAge / colorFadeLength, 1)),
    front: 0,
    reprint: easeOutQuad(Math.min(reprintAge / reprintLength, 1)),
    ring: ringReach,
  };
};

export type BlastMode = "running" | "still";

export interface StagePoint {
  x: number;
  y: number;
}

export interface Blast {
  time: number;
  firedAt: number;
  origin: StagePoint;
  frame: BlastFrame;
}

export const createBlast = (): Blast => ({
  firedAt: -Infinity,
  frame: idleFrame,
  origin: { x: 0.5, y: 0.5 },
  time: 0,
});

export interface BlastStep {
  step: number;
  mode: BlastMode;
  request: StagePoint | null;
}

export const advanceBlast = (
  blast: Blast,
  { step, mode, request }: BlastStep
) => {
  if (mode === "still") {
    blast.firedAt = -Infinity;
    blast.frame = idleFrame;
    return blast;
  }
  blast.time += step;
  if (request && blast.time - blast.firedAt >= rearmAfter) {
    blast.firedAt = blast.time;
    blast.origin = { x: request.x, y: request.y };
  }
  blast.frame = blastFrame(blast.time - blast.firedAt);
  return blast;
};
