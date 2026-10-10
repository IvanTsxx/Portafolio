import { describe, expect, test } from "bun:test";

import {
  compositeOver,
  contrastRatio,
  gradeContrast,
  oklchToSrgb,
  parseOklch,
  toHex,
} from "./color";

const black = [0, 0, 0] as const;
const white = [1, 1, 1] as const;

describe("parseOklch", () => {
  test("reads lightness, chroma, hue and percent alpha", () => {
    expect(parseOklch("oklch(0.18 0 0 / 14%)")).toEqual({
      alpha: 0.14,
      chroma: 0,
      hue: 0,
      lightness: 0.18,
    });
  });

  test("accepts percent lightness and rejects other syntaxes", () => {
    expect(parseOklch("oklch(94% 0.003 106)")?.lightness).toBeCloseTo(0.94);
    expect(parseOklch("#ededeb")).toBeNull();
    expect(parseOklch("var(--ink)")).toBeNull();
  });
});

describe("oklchToSrgb", () => {
  test("maps the lightness extremes to black and white", () => {
    expect(
      toHex(oklchToSrgb({ alpha: 1, chroma: 0, hue: 0, lightness: 0 }))
    ).toBe("#000000");
    expect(
      toHex(oklchToSrgb({ alpha: 1, chroma: 0, hue: 0, lightness: 1 }))
    ).toBe("#ffffff");
  });

  test("converts the paper token to its sRGB hex", () => {
    const paper = parseOklch("oklch(0.94 0.003 106)");
    expect(paper ? toHex(oklchToSrgb(paper)) : "").toBe("#ebebe9");
  });
});

describe("contrastRatio", () => {
  test("is 21 for black on white and symmetric", () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, black)).toBeCloseTo(21, 5);
  });

  test("is 1 for identical colors", () => {
    expect(contrastRatio(white, white)).toBe(1);
  });

  test("composites translucent ink over paper before measuring", () => {
    const ink = oklchToSrgb({ alpha: 1, chroma: 0, hue: 0, lightness: 0.18 });
    const paper = oklchToSrgb({
      alpha: 1,
      chroma: 0.003,
      hue: 106,
      lightness: 0.94,
    });
    const hairline = contrastRatio(compositeOver(ink, 0.14, paper), paper);
    const strong = contrastRatio(compositeOver(ink, 0.7, paper), paper);
    expect(hairline).toBeLessThan(2);
    expect(strong).toBeGreaterThan(4.5);
  });
});

describe("gradeContrast", () => {
  test("grades on the WCAG thresholds", () => {
    expect(gradeContrast(7)).toBe("AAA");
    expect(gradeContrast(4.5)).toBe("AA");
    expect(gradeContrast(3)).toBe("AA-large");
    expect(gradeContrast(2.99)).toBe("non-text");
  });
});
