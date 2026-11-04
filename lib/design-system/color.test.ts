import { describe, expect, test } from "bun:test";

import { contrastRatio, gradeContrast, parseHex, toHex } from "./color";

const black = [0, 0, 0] as const;
const white = [1, 1, 1] as const;

describe("parseHex", () => {
  test("reads six digit hex in either case", () => {
    expect(parseHex("#ffffff")).toEqual([1, 1, 1]);
    expect(parseHex(" #0B0B0C ")).toEqual([11 / 255, 11 / 255, 12 / 255]);
  });

  test("rejects shorthand, alpha and other syntaxes", () => {
    expect(parseHex("#fff")).toBeNull();
    expect(parseHex("#ffffff80")).toBeNull();
    expect(parseHex("oklch(0.94 0.003 106)")).toBeNull();
    expect(parseHex("var(--foreground)")).toBeNull();
  });

  test("round-trips through toHex", () => {
    for (const hex of ["#0b0b0c", "#edece8", "#9aabb9", "#f7f6f2"]) {
      const rgb = parseHex(hex);
      expect(rgb ? toHex(rgb) : "").toBe(hex);
    }
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

  test("reads the bone on charcoal pair as AAA", () => {
    const bone = parseHex("#edece8");
    const charcoal = parseHex("#0b0b0c");
    expect(
      bone && charcoal ? contrastRatio(bone, charcoal) : 0
    ).toBeGreaterThan(15);
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
