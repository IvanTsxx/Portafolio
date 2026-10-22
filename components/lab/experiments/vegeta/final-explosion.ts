export const ringLength = 0.6;
export const reprintLength = 1.1;
export const colorHold = 0.8;
export const colorFade = 0.9;
export const explosionLength =
  ringLength + reprintLength + colorHold + colorFade;
export const rearmAfter = ringLength + reprintLength;
export const ringReach = 2.2;
export const restingPulse = 0.5;

const majinPeriod = 1.4;

export interface ExplosionFrame {
  ring: number;
  front: number;
  reprint: number;
  color: number;
}

export const idleFrame: ExplosionFrame = {
  color: 0,
  front: 0,
  reprint: 1,
  ring: 0,
};

const easeOut = (progress: number) => 1 - (1 - progress) ** 3;
const easeInOut = (progress: number) =>
  progress * progress * (3 - 2 * progress);

export const explosionFrame = (age: number): ExplosionFrame => {
  if (!(age >= 0) || age >= explosionLength) {
    return idleFrame;
  }
  if (age < ringLength) {
    const progress = age / ringLength;
    return {
      color: 0,
      front: 1 - progress,
      reprint: 0,
      ring: ringReach * easeOut(progress),
    };
  }
  const reprintAge = age - ringLength;
  const fadeAge = reprintAge - reprintLength - colorHold;
  return {
    color: fadeAge <= 0 ? 1 : (1 - Math.min(fadeAge / colorFade, 1)) ** 2,
    front: 0,
    reprint: easeInOut(Math.min(reprintAge / reprintLength, 1)),
    ring: ringReach,
  };
};

export const majinPulse = (time: number) =>
  (0.5 - 0.5 * Math.cos((2 * Math.PI * time) / majinPeriod)) ** 2;

export type KiMode = "running" | "still";

export interface StagePoint {
  x: number;
  y: number;
}

export interface Ki {
  time: number;
  pulse: number;
  firedAt: number;
  handledDetonations: number;
  blast: StagePoint;
  frame: ExplosionFrame;
}

export const createKi = (): Ki => ({
  blast: { x: 0.5, y: 0.5 },
  firedAt: -Infinity,
  frame: idleFrame,
  handledDetonations: 0,
  pulse: restingPulse,
  time: 0,
});

export interface KiStep {
  step: number;
  mode: KiMode;
  detonations: number;
  origin: StagePoint;
}

export const advanceKi = (
  ki: Ki,
  { step, mode, detonations, origin }: KiStep
) => {
  const isRequested = detonations !== ki.handledDetonations;
  ki.handledDetonations = detonations;
  if (mode === "still") {
    ki.firedAt = -Infinity;
    ki.frame = idleFrame;
    ki.pulse = restingPulse;
    return ki;
  }
  ki.time += step;
  if (isRequested && ki.time - ki.firedAt >= rearmAfter) {
    ki.firedAt = ki.time;
    ki.blast = { x: origin.x, y: origin.y };
  }
  ki.frame = explosionFrame(ki.time - ki.firedAt);
  ki.pulse = majinPulse(ki.time);
  return ki;
};
