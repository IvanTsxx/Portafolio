export const maxImpressions = 12;
export const maxStampLength = 12;

const padDrawPerPress = 0.085;
const driestShare = 0.3;
const wearPerPress = 0.012;
const maxTilt = 0.07;
const maxJitter = 0.012;

export interface Impression {
  id: number;
  slot: number;
  x: number;
  y: number;
  rotation: number;
  ink: number;
  wear: number;
  seed: number;
  pressedAt: number;
}

export interface StampSheet {
  padLoad: number;
  presses: number;
  impressions: readonly Impression[];
}

export interface PressInput {
  x: number;
  y: number;
  inkAmount: number;
  wear: number;
  pressedAt: number;
  random: () => number;
}

export const emptySheet: StampSheet = {
  impressions: [],
  padLoad: 1,
  presses: 0,
};

export const nextSlot = (sheet: StampSheet) => sheet.presses % maxImpressions;

export const impressionInk = (inkAmount: number, padLoad: number) =>
  inkAmount * (driestShare + (1 - driestShare) * padLoad);

const spread = (random: () => number, reach: number) =>
  (random() * 2 - 1) * reach;

export const pressStamp = (
  sheet: StampSheet,
  { x, y, inkAmount, wear, pressedAt, random }: PressInput
): StampSheet => {
  const slot = nextSlot(sheet);
  const impression: Impression = {
    id: sheet.presses,
    ink: impressionInk(inkAmount, sheet.padLoad),
    pressedAt,
    rotation: spread(random, maxTilt),
    seed: random() * 97,
    slot,
    wear: Math.min(wear + sheet.presses * wearPerPress, 1),
    x: x + spread(random, maxJitter),
    y: y + spread(random, maxJitter),
  };
  return {
    impressions: [
      ...sheet.impressions.filter((existing) => existing.slot !== slot),
      impression,
    ],
    padLoad: Math.max(sheet.padLoad - padDrawPerPress, 0),
    presses: sheet.presses + 1,
  };
};

export const refillPad = (sheet: StampSheet): StampSheet => ({
  ...sheet,
  padLoad: 1,
});
