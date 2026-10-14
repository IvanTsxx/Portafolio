import { describe, expect, test } from "bun:test";

import { emptySheet, maxImpressions, pressStamp, refillPad } from "./stamp-pad";
import type { StampSheet } from "./stamp-pad";

const centered = () => 0.5;

const pressTimes = (count: number, start: StampSheet = emptySheet) => {
  let sheet = start;
  for (let press = 0; press < count; press += 1) {
    sheet = pressStamp(sheet, {
      inkAmount: 1,
      pressedAt: press,
      random: centered,
      wear: 0.2,
      x: 0.5,
      y: 0.5,
    });
  }
  return sheet;
};

const inkOf = (sheet: StampSheet, id: number) =>
  sheet.impressions.find((impression) => impression.id === id)?.ink ?? 0;

describe("stamp pad", () => {
  test("repeated presses fade until the pad is refilled", () => {
    const sheet = pressTimes(10);
    expect(inkOf(sheet, 0)).toBe(1);
    for (let id = 1; id < 10; id += 1) {
      expect(inkOf(sheet, id)).toBeLessThan(inkOf(sheet, id - 1));
    }
    const refilled = pressTimes(1, refillPad(sheet));
    expect(inkOf(refilled, 10)).toBe(1);
  });

  test("a dry pad still leaves a faint print", () => {
    const sheet = pressTimes(40);
    const last = sheet.impressions.at(-1);
    expect(last?.ink).toBeGreaterThan(0.25);
    expect(last?.ink).toBeLessThan(0.35);
  });

  test("the sheet keeps the latest impressions and reuses their slots", () => {
    const sheet = pressTimes(maxImpressions + 3);
    expect(sheet.impressions).toHaveLength(maxImpressions);
    expect(sheet.impressions.map((impression) => impression.id)).toEqual(
      Array.from({ length: maxImpressions }, (_, index) => index + 3)
    );
    const slots = new Set(
      sheet.impressions.map((impression) => impression.slot)
    );
    expect(slots.size).toBe(maxImpressions);
  });

  test("wear grows with use", () => {
    const sheet = pressTimes(5);
    const wears = sheet.impressions.map((impression) => impression.wear);
    expect(wears).toEqual(wears.toSorted((first, second) => first - second));
    expect(wears.at(-1)).toBeGreaterThan(wears[0] ?? 1);
  });
});
