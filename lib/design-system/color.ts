export interface Oklch {
  alpha: number;
  chroma: number;
  hue: number;
  lightness: number;
}

export type Rgb = readonly [number, number, number];

export type ContrastGrade = "AAA" | "AA" | "AA-large" | "non-text";

const oklchPattern =
  /^oklch\(\s*(?<lightness>[\d.]+%?)\s+(?<chroma>[\d.]+)\s+(?<hue>[\d.]+)(?:\s*\/\s*(?<alpha>[\d.]+%?))?\s*\)$/u;

const percentOrUnit = (value: string) =>
  value.endsWith("%") ? Number(value.slice(0, -1)) / 100 : Number(value);

export const parseOklch = (value: string): Oklch | null => {
  const groups = oklchPattern.exec(value.trim())?.groups;
  if (!groups) {
    return null;
  }
  const { alpha, chroma, hue, lightness } = groups;
  if (lightness === undefined || chroma === undefined || hue === undefined) {
    return null;
  }
  return {
    alpha: alpha === undefined ? 1 : percentOrUnit(alpha),
    chroma: Number(chroma),
    hue: Number(hue),
    lightness: percentOrUnit(lightness),
  };
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const linearToGamma = (value: number) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;

const gammaToLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

export const oklchToSrgb = ({ chroma, hue, lightness }: Oklch): Rgb => {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp01(
      linearToGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
    ),
    clamp01(
      linearToGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
    ),
    clamp01(
      linearToGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    ),
  ];
};

export const compositeOver = (
  foreground: Rgb,
  alpha: number,
  background: Rgb
): Rgb => [
  foreground[0] * alpha + background[0] * (1 - alpha),
  foreground[1] * alpha + background[1] * (1 - alpha),
  foreground[2] * alpha + background[2] * (1 - alpha),
];

export const relativeLuminance = ([red, green, blue]: Rgb) =>
  0.2126 * gammaToLinear(red) +
  0.7152 * gammaToLinear(green) +
  0.0722 * gammaToLinear(blue);

export const contrastRatio = (first: Rgb, second: Rgb) => {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

export const toHex = (rgb: Rgb) =>
  `#${rgb
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

const aaaThreshold = 7;
const aaThreshold = 4.5;
const aaLargeThreshold = 3;

export const gradeContrast = (ratio: number): ContrastGrade => {
  if (ratio >= aaaThreshold) {
    return "AAA";
  }
  if (ratio >= aaThreshold) {
    return "AA";
  }
  if (ratio >= aaLargeThreshold) {
    return "AA-large";
  }
  return "non-text";
};
