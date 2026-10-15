import type { Rgb } from "./palette";

export const ditherOptions = [
  { label: "2×2", value: "bayer-2" },
  { label: "4×4", value: "bayer-4" },
  { label: "8×8", value: "bayer-8" },
  { label: "Blue", value: "blue-noise" },
  { label: "Dots", value: "halftone" },
] as const;

export type DitherMode = (typeof ditherOptions)[number]["value"];

export const ditherShaderIndex = (mode: DitherMode) =>
  ditherOptions.findIndex((option) => option.value === mode);

export const printOptions = [
  { label: "Ink", value: "ink" },
  { label: "Duotone", value: "duotone" },
  { label: "Retro", value: "retro" },
] as const;

export type PrintMode = (typeof printOptions)[number]["value"];

export const inkRgb: Rgb = [0x14, 0x14, 0x14];
export const paperRgb: Rgb = [0xed, 0xed, 0xeb];

export const duotoneOptions = [
  {
    label: "Steel",
    rgb: [0x34, 0x5a, 0x73],
    token: "--signal-steel",
    value: "steel",
  },
  {
    label: "Moss",
    rgb: [0x34, 0x6c, 0x42],
    token: "--signal-moss",
    value: "moss",
  },
  {
    label: "Rust",
    rgb: [0xae, 0x40, 0x24],
    token: "--signal-rust",
    value: "rust",
  },
] as const satisfies readonly {
  label: string;
  rgb: Rgb;
  token: string;
  value: string;
}[];

export type DuotoneInk = (typeof duotoneOptions)[number]["value"];

export const colorHoldForever = 8;

export interface SuperSaiyanSettings {
  dither: DitherMode;
  print: PrintMode;
  duotone: DuotoneInk;
  cell: number;
  threshold: number;
  contrast: number;
  gamma: number;
  isInverted: boolean;
  rainAmount: number;
  rainSpeed: number;
  rainAngle: number;
  isLightning: boolean;
  frequency: number;
  intensity: number;
  colorHold: number;
  auraRadius: number;
  auraStrength: number;
  isPaused: boolean;
}

export const defaultSettings: SuperSaiyanSettings = {
  auraRadius: 1,
  auraStrength: 1,
  cell: 3,
  colorHold: 1.2,
  contrast: 1.35,
  dither: "bayer-8",
  duotone: "steel",
  frequency: 0.5,
  gamma: 1,
  intensity: 1,
  isInverted: false,
  isLightning: true,
  isPaused: false,
  print: "ink",
  rainAmount: 1,
  rainAngle: 9,
  rainSpeed: 1,
  threshold: 0,
};

export const colorLinger = (colorHold: number) =>
  colorHold >= colorHoldForever ? Infinity : colorHold;

export const inkFor = ({ print, duotone }: SuperSaiyanSettings): Rgb => {
  if (print !== "duotone") {
    return inkRgb;
  }
  return (
    duotoneOptions.find((option) => option.value === duotone)?.rgb ?? inkRgb
  );
};
