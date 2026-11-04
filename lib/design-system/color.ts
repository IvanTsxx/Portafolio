export type Rgb = readonly [number, number, number];

export type ContrastGrade = "AAA" | "AA" | "AA-large" | "non-text";

const hexPattern = /^#[\da-f]{6}$/iu;

export const parseHex = (value: string): Rgb | null => {
  const trimmed = value.trim();
  if (!hexPattern.test(trimmed)) {
    return null;
  }
  const channel = (offset: number) =>
    Number.parseInt(trimmed.slice(offset, offset + 2), 16) / 255;
  return [channel(1), channel(3), channel(5)];
};

const gammaToLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

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
