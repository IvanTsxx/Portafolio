const strikeLength = 0.9;
const firstRise = 0.05;
const secondDelay = 0.2;
const secondRise = 0.04;
const secondPeak = 0.75;
const colorRise = 0.32;
const colorFade = 0.75;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;
const easeInOutCubic = (progress: number) =>
  progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

export const flashEnvelope = (age: number) => {
  if (age < 0 || age > strikeLength) {
    return 0;
  }
  const first =
    age < firstRise ? age / firstRise : Math.exp(-(age - firstRise) * 14);
  const secondAge = age - secondDelay;
  let second = 0;
  if (secondAge >= 0) {
    second =
      secondAge < secondRise
        ? (secondAge / secondRise) * secondPeak
        : secondPeak * Math.exp(-(secondAge - secondRise) * 6);
  }
  return Math.min(first + second, 1);
};

export const colorEnvelope = (age: number, linger: number) => {
  if (age < 0) {
    return 0;
  }
  if (age < colorRise) {
    return easeOutCubic(age / colorRise);
  }
  const fadeAge = age - colorRise - linger;
  if (fadeAge <= 0) {
    return 1;
  }
  return 1 - easeInOutCubic(Math.min(fadeAge / colorFade, 1));
};

export const firstStrikeAt = 1.6;
export const minStrikeGap = 3;
export const manualStrikeSpacing = 1;

export const nextStrikeGap = (random: number, frequency = 0.5) => {
  const rate = Math.min(Math.max(frequency, 0), 1);
  const shortest = minStrikeGap + (1 - rate) * 6;
  return shortest + random * (3 + (1 - rate) * 4);
};

export interface StormSettings {
  lightning: boolean;
  frequency: number;
  flash: number;
  colorHold: number;
}

export interface StrikePoint {
  x: number;
  y: number;
}

export interface Storm {
  time: number;
  strikeAt: number;
  nextStrike: number;
  seed: number;
  landing: StrikePoint;
  flash: number;
  color: number;
}

export const createStorm = (): Storm => ({
  color: 0,
  flash: 0,
  landing: { x: 0.5, y: 0.5 },
  nextStrike: firstStrikeAt,
  seed: 0,
  strikeAt: -Infinity,
  time: 0,
});

export type StormMode = "running" | "still";

export interface StormStep {
  step: number;
  mode: StormMode;
  isRequested: boolean;
  landing?: StrikePoint | null;
  random: () => number;
}

const skyLanding = (random: () => number): StrikePoint => ({
  x: 0.12 + random() * 0.76,
  y: 0.36 + random() * 0.2,
});

const strike = (
  storm: Storm,
  settings: StormSettings,
  random: () => number,
  landing: StrikePoint
) => {
  storm.strikeAt = storm.time;
  storm.seed = random();
  storm.landing = { x: landing.x, y: landing.y };
  storm.nextStrike = storm.time + nextStrikeGap(random(), settings.frequency);
};

export const advanceStorm = (
  storm: Storm,
  settings: StormSettings,
  { step, mode, isRequested, landing = null, random }: StormStep
) => {
  if (mode === "still") {
    storm.flash = 0;
    storm.color = 0;
    return storm;
  }
  storm.time += step;
  const canStrike = storm.time - storm.strikeAt >= manualStrikeSpacing;
  if (isRequested && canStrike) {
    strike(storm, settings, random, landing ?? skyLanding(random));
  } else if (settings.lightning && storm.time >= storm.nextStrike) {
    strike(storm, settings, random, skyLanding(random));
  }
  const age = storm.time - storm.strikeAt;
  storm.flash = flashEnvelope(age) * Math.min(Math.max(settings.flash, 0), 1);
  storm.color = colorEnvelope(age, settings.colorHold);
  return storm;
};
