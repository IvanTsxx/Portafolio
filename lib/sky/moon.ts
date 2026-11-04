const synodicMonthDays = 29.530588853;
const referenceNewMoonMs = Date.UTC(2000, 0, 6, 18, 14);
const dayMs = 86_400_000;

export const moonPhaseNames = [
  "New moon",
  "Waxing crescent",
  "First quarter",
  "Waxing gibbous",
  "Full moon",
  "Waning gibbous",
  "Last quarter",
  "Waning crescent",
] as const;

export type MoonPhaseName = (typeof moonPhaseNames)[number];

export interface MoonReading {
  ageDays: number;
  illumination: number;
  isWaxing: boolean;
  name: MoonPhaseName;
  phase: number;
}

const wrapUnit = (value: number) => value - Math.floor(value);

const nameByIllumination = (
  illumination: number,
  isWaxing: boolean
): MoonPhaseName => {
  if (illumination < 0.03) {
    return "New moon";
  }
  if (illumination > 0.97) {
    return "Full moon";
  }
  if (Math.abs(illumination - 0.5) < 0.08) {
    return isWaxing ? "First quarter" : "Last quarter";
  }
  if (illumination < 0.5) {
    return isWaxing ? "Waxing crescent" : "Waning crescent";
  }
  return isWaxing ? "Waxing gibbous" : "Waning gibbous";
};

export const readMoon = (date: Date): MoonReading => {
  const elapsedDays = (date.getTime() - referenceNewMoonMs) / dayMs;
  const phase = wrapUnit(elapsedDays / synodicMonthDays);
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  return {
    ageDays: phase * synodicMonthDays,
    illumination,
    isWaxing: phase < 0.5,
    name: nameByIllumination(illumination, phase < 0.5),
    phase,
  };
};

export const moonLightDirection = (
  phase: number,
  hemisphere: "north" | "south"
): readonly [number, number, number] => {
  const angle = phase * 2 * Math.PI;
  const side = hemisphere === "south" ? -1 : 1;
  return [Math.sin(angle) * side, 0.15, -Math.cos(angle)];
};

export const formatIllumination = (illumination: number) =>
  `${Math.round(illumination * 100)}%`;
