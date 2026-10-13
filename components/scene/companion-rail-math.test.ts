import { describe, expect, test } from "bun:test";

import { activeStopIndex, railLayout, railShare } from "./companion-rail-math";

const homeLike = railLayout({
  landingOffset: 80,
  maxScroll: 5000,
  minGap: 0.08,
  sectionTops: [900, 1900, 2700, 3600, 4800, 5600],
});

describe("section rail", () => {
  test("the companion stands exactly on a mark whenever the page rests on that section", () => {
    for (const [index, stop] of homeLike.stops.entries()) {
      if (homeLike.stops.indexOf(stop) !== index) {
        continue;
      }
      const lastWithStop = homeLike.stops.lastIndexOf(stop);
      expect(railShare(stop, homeLike.anchors)).toBeCloseTo(
        homeLike.marks[lastWithStop] ?? -1,
        6
      );
    }
  });

  test("the rail runs top to bottom with the scroll and never moves backwards", () => {
    let previous = -1;
    for (let scroll = 0; scroll <= 5000; scroll += 25) {
      const share = railShare(scroll, homeLike.anchors);
      expect(share).toBeGreaterThanOrEqual(previous);
      previous = share;
    }
    expect(railShare(0, homeLike.anchors)).toBe(0);
    expect(railShare(5000, homeLike.anchors)).toBe(1);
    expect(railShare(9000, homeLike.anchors)).toBe(1);
  });

  test("sections that all land at the page end still get separate, readable marks", () => {
    const crowded = railLayout({
      landingOffset: 80,
      maxScroll: 2000,
      minGap: 0.08,
      sectionTops: [600, 1400, 2300, 2500, 2700],
    });
    expect(crowded.stops.slice(2)).toEqual([2000, 2000, 2000]);
    for (let index = 1; index < crowded.marks.length; index += 1) {
      const gap = (crowded.marks[index] ?? 0) - (crowded.marks[index - 1] ?? 0);
      expect(gap).toBeGreaterThanOrEqual(0.08 - 1e-9);
    }
    expect(crowded.marks.at(-1)).toBe(1);
    expect(Math.min(...crowded.marks)).toBeGreaterThanOrEqual(0);
    expect(railShare(2000, crowded.anchors)).toBe(1);
  });

  test("a page too short to scroll spreads the marks evenly instead of stacking them", () => {
    const flat = railLayout({
      landingOffset: 80,
      maxScroll: 0,
      minGap: 0.08,
      sectionTops: [200, 400, 600],
    });
    expect(flat.marks).toEqual([0, 0.5, 1]);
    expect(railShare(0, flat.anchors)).toBe(1);
  });

  test("the active section is the last one the reader has reached, and none before the first", () => {
    expect(activeStopIndex(0, homeLike.stops)).toBe(-1);
    expect(activeStopIndex(820, homeLike.stops)).toBe(0);
    expect(activeStopIndex(1811, homeLike.stops)).toBe(0);
    expect(activeStopIndex(1812, homeLike.stops)).toBe(1);
    expect(activeStopIndex(5000, homeLike.stops)).toBe(5);
  });
});
