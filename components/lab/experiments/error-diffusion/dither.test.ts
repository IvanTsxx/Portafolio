import { describe, expect, test } from "bun:test";

import type { Raster } from "./dither";
import {
  applyTone,
  diffuse,
  diffusionNames,
  orderedDither,
  rampRaster,
} from "./dither";

const flatGray = (tone: number, width = 64, height = 64): Raster => ({
  height,
  values: new Float32Array(width * height).fill(tone),
  width,
});

const coverage = (ink: Uint8Array) =>
  ink.reduce((total, mark) => total + mark, 0) / ink.length;

const conservingKernels = diffusionNames.filter((name) => name !== "atkinson");

describe("error diffusion", () => {
  test.each(conservingKernels)(
    "%s keeps the mean tone of flat gray",
    (name) => {
      for (const tone of [32, 96, 160, 224]) {
        const ink = diffuse(flatGray(tone), name, true);
        expect(coverage(ink)).toBeCloseTo(1 - tone / 255, 1);
      }
    }
  );

  test("atkinson drops a quarter of the error, so mid gray stays near half", () => {
    const ink = diffuse(flatGray(128), "atkinson", false);
    expect(coverage(ink)).toBeGreaterThan(0.4);
    expect(coverage(ink)).toBeLessThan(0.6);
  });

  test("serpentine scanning changes the pattern but not the tone", () => {
    const raster = flatGray(100);
    const forward = diffuse(raster, "floyd-steinberg", false);
    const serpentine = diffuse(raster, "floyd-steinberg", true);
    expect(forward).not.toEqual(serpentine);
    expect(coverage(serpentine)).toBeCloseTo(coverage(forward), 2);
  });

  test("pure black and white stay solid", () => {
    expect(coverage(diffuse(flatGray(0), "jarvis", true))).toBe(1);
    expect(coverage(diffuse(flatGray(255), "sierra", true))).toBe(0);
  });
});

describe("ordered dither", () => {
  test("bayer 8x8 tracks the tone in 1/64 steps", () => {
    expect(coverage(orderedDither(flatGray(128)))).toBeCloseTo(0.5, 1);
    expect(coverage(orderedDither(flatGray(64)))).toBeCloseTo(0.75, 1);
  });
});

describe("tone", () => {
  test("raising the threshold darkens the image", () => {
    const ramp = rampRaster(32, 64);
    const neutral = coverage(
      orderedDither(applyTone(ramp, { contrast: 1, threshold: 128 }))
    );
    const raised = coverage(
      orderedDither(applyTone(ramp, { contrast: 1, threshold: 176 }))
    );
    expect(raised).toBeGreaterThan(neutral);
  });
});
