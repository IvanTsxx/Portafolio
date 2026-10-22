import { describe, expect, test } from "bun:test";

import {
  bayerThresholds,
  ditherFrame,
  orderPalette,
} from "@/registry/ivan/lib/dither";
import type { DitherFrame, Rgb } from "@/registry/ivan/lib/dither";
import { driftRows } from "@/registry/ivan/lib/dither-drift";

const ink: Rgb = [20, 20, 20];
const paper: Rgb = [240, 240, 236];
const palette = orderPalette(ink, paper);

const solidFrame = (width: number, height: number, level: number) => ({
  data: new Uint8ClampedArray(width * height * 4).map((_, index) =>
    index % 4 === 3 ? 255 : level
  ),
  height,
  width,
});

const gradientFrame = (width: number, height: number): DitherFrame => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const level = Math.round((x / (width - 1)) * 255);
      data.set([level, level, level, 255], (y * width + x) * 4);
    }
  }
  return { data, height, width };
};

const pixelAt = (frame: DitherFrame, x: number, y: number) =>
  [
    ...frame.data.subarray(
      (y * frame.width + x) * 4,
      (y * frame.width + x) * 4 + 3
    ),
  ].join(",");

const rowOf = (data: Uint8ClampedArray, width: number, y: number) => [
  ...data.subarray(y * width * 4, (y + 1) * width * 4),
];

describe("dither", () => {
  test("the darker color takes the shadows whichever order it comes in", () => {
    expect(orderPalette(paper, ink)).toEqual({ dark: ink, light: paper });
    expect(orderPalette(ink, paper)).toEqual({ dark: ink, light: paper });
  });

  test("the Bayer matrix holds sixteen distinct thresholds inside 0 to 1", () => {
    expect(new Set(bayerThresholds).size).toBe(16);
    for (const threshold of bayerThresholds) {
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThan(1);
    }
  });

  test("black and white sources resolve to a single tone", () => {
    const options = { contrast: 14, pixelSize: 2 };
    const black = ditherFrame(solidFrame(8, 8, 0), palette, options);
    const white = ditherFrame(solidFrame(8, 8, 255), palette, options);
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        expect(pixelAt(black, x, y)).toBe("20,20,20");
        expect(pixelAt(white, x, y)).toBe("240,240,236");
      }
    }
  });

  test("a gradient uses only the two palette colors, in uniform blocks, darker on the dark side", () => {
    const pixelSize = 3;
    const frame = ditherFrame(gradientFrame(48, 12), palette, {
      contrast: 14,
      pixelSize,
    });
    const allowed = new Set(["20,20,20", "240,240,236"]);
    let lightOnLeft = 0;
    let lightOnRight = 0;
    for (let y = 0; y < frame.height; y += 1) {
      for (let x = 0; x < frame.width; x += 1) {
        const color = pixelAt(frame, x, y);
        expect(allowed.has(color)).toBe(true);
        const blockOrigin = pixelAt(
          frame,
          x - (x % pixelSize),
          y - (y % pixelSize)
        );
        expect(color).toBe(blockOrigin);
        if (color === "240,240,236") {
          if (x < frame.width / 2) {
            lightOnLeft += 1;
          } else {
            lightOnRight += 1;
          }
        }
      }
    }
    expect(lightOnRight).toBeGreaterThan(lightOnLeft);
  });
});

describe("dither drift", () => {
  const source = ditherFrame(gradientFrame(32, 16), palette, {
    contrast: 14,
    pixelSize: 2,
  });
  const settings = { amplitude: 11, band: 0.16, cell: 2 };

  test("at rest the drift copies the source untouched", () => {
    const target = new Uint8ClampedArray(source.data.length);
    driftRows(source, target, { x: 16, y: 8 }, 0, 1200, settings);
    expect([...target]).toEqual([...source.data]);
  });

  test("while hovered every row is a rotation of its source row", () => {
    const target = new Uint8ClampedArray(source.data.length);
    driftRows(source, target, { x: 28, y: 8 }, 1, 1200, settings);
    let shiftedRows = 0;
    for (let y = 0; y < source.height; y += 1) {
      const original = rowOf(source.data, source.width, y);
      const drifted = rowOf(target, source.width, y);
      expect(drifted.toSorted()).toEqual(original.toSorted());
      const doubled = [...original, ...original].join(",");
      expect(doubled.includes(drifted.join(","))).toBe(true);
      if (drifted.join(",") !== original.join(",")) {
        shiftedRows += 1;
      }
    }
    expect(shiftedRows).toBeGreaterThan(0);
  });
});
