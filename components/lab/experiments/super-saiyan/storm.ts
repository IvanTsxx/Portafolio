const strikeLength = 0.9;
const firstRise = 0.05;
const secondDelay = 0.2;
const secondRise = 0.04;
const secondPeak = 0.75;
const colorRise = 0.06;
const colorFade = 0.9;

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
    return age / colorRise;
  }
  const fadeAge = age - colorRise - linger;
  if (fadeAge <= 0) {
    return 1;
  }
  const progress = Math.min(fadeAge / colorFade, 1);
  return (1 - progress) ** 2;
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
  isLightning: boolean;
  frequency: number;
  intensity: number;
  colorLinger: number;
}

export interface Storm {
  time: number;
  strikeAt: number;
  nextStrike: number;
  handledStrikes: number;
  seed: number;
  flash: number;
  color: number;
}

export const createStorm = (): Storm => ({
  color: 0,
  flash: 0,
  handledStrikes: 0,
  nextStrike: firstStrikeAt,
  seed: 0,
  strikeAt: -Infinity,
  time: 0,
});

export type StormMode = "running" | "paused" | "still";

export interface StormStep {
  step: number;
  mode: StormMode;
  requestedStrikes: number;
  random: () => number;
}

const strike = (
  storm: Storm,
  settings: StormSettings,
  random: () => number
) => {
  storm.strikeAt = storm.time;
  storm.seed = random();
  storm.nextStrike = storm.time + nextStrikeGap(random(), settings.frequency);
};

export const advanceStorm = (
  storm: Storm,
  settings: StormSettings,
  { step, mode, requestedStrikes, random }: StormStep
) => {
  const isRequested = requestedStrikes !== storm.handledStrikes;
  storm.handledStrikes = requestedStrikes;
  if (mode === "still") {
    storm.flash = 0;
    storm.color = 0;
    return storm;
  }
  if (mode === "paused") {
    return storm;
  }
  storm.time += step;
  const canStrike = storm.time - storm.strikeAt >= manualStrikeSpacing;
  if (isRequested && canStrike) {
    strike(storm, settings, random);
  } else if (settings.isLightning && storm.time >= storm.nextStrike) {
    strike(storm, settings, random);
  }
  const age = storm.time - storm.strikeAt;
  storm.flash =
    flashEnvelope(age) * Math.min(Math.max(settings.intensity, 0), 1);
  storm.color = colorEnvelope(age, settings.colorLinger);
  return storm;
};
