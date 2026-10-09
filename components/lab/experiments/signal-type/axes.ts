import type { CSSProperties } from "react";

export const widthAxis = { max: 125, min: 62 } as const;
export const weightAxis = { max: 900, min: 160 } as const;

type AxesStyle = CSSProperties & { "--wdth": number; "--wght": number };

export const axesAt = (influence: number) => ({
  "--wdth": widthAxis.min + (widthAxis.max - widthAxis.min) * influence,
  "--wght": weightAxis.min + (weightAxis.max - weightAxis.min) * influence,
});

export const rampInfluence = (letterIndex: number, letterCount: number) =>
  letterCount <= 1
    ? 1
    : 1 - Math.abs(letterIndex / (letterCount - 1) - 0.5) * 2;

export const letterStyle = (influence: number): AxesStyle => ({
  ...axesAt(influence),
  fontVariationSettings: '"wdth" var(--wdth), "wght" var(--wght)',
});
