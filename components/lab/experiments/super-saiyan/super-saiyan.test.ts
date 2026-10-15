import { describe, expect, test } from "bun:test";
import path from "node:path";

import sharp from "sharp";

import { parseOklch, oklchToSrgb } from "@/lib/design-system/color";

import { blueNoiseRanks } from "./blue-noise";
import { extractPalette, paletteSample, retroPaletteSize } from "./palette";
import { posterBitmap } from "./poster-bitmap";
import { ditherPoster, encodeInkPng, posterGrid } from "./poster-raster";
import { retroPalette } from "./retro-palette";
import { duotoneOptions } from "./settings";
import {
  advanceStorm,
  colorEnvelope,
  createStorm,
  flashEnvelope,
  minStrikeGap,
  nextStrikeGap,
} from "./storm";
import type { StormMode, StormSettings } from "./storm";
import { curveTone } from "./tone";

const side = 32;

const nearestSpacing = (ranks: Uint16Array, count: number) => {
  const points: [number, number][] = [];
  for (const [index, rank] of ranks.entries()) {
    if (rank < count) {
      points.push([index % side, Math.floor(index / side)]);
    }
  }
  let nearest = Infinity;
  for (const [ax, ay] of points) {
    for (const [bx, by] of points) {
      if (ax === bx && ay === by) {
        continue;
      }
      const dx = Math.min(Math.abs(ax - bx), side - Math.abs(ax - bx));
      const dy = Math.min(Math.abs(ay - by), side - Math.abs(ay - by));
      nearest = Math.min(nearest, Math.hypot(dx, dy));
    }
  }
  return nearest;
};

describe("blue noise threshold", () => {
  const ranks = blueNoiseRanks(side);

  test("every threshold level appears exactly once", () => {
    const sorted = [...ranks].toSorted((a, b) => a - b);
    expect(sorted).toEqual(
      Array.from({ length: side * side }, (_, rank) => rank)
    );
  });

  test("the shipped tile spreads its 256 levels evenly", async () => {
    const tile = path.join(
      import.meta.dir,
      "../../../../public/experiments/blue-noise-64.png"
    );
    const levels = await sharp(tile).extractChannel(0).raw().toBuffer();
    const counts = new Map<number, number>();
    for (const level of levels) {
      counts.set(level, (counts.get(level) ?? 0) + 1);
    }
    expect(levels.length).toBe(64 * 64);
    expect(new Set(counts.values())).toEqual(new Set([16]));
  });

  test("the darkest tenth of dots never touch, unlike white noise", () => {
    expect(nearestSpacing(ranks, (side * side) / 10)).toBeGreaterThanOrEqual(2);
  });
});

describe("tone curve", () => {
  test("keeps black and white solid and stays monotonic", () => {
    expect(curveTone(0, 0)).toBe(0);
    expect(curveTone(1, 1)).toBe(1);
    let previous = -1;
    for (let luma = 0; luma <= 1; luma += 0.05) {
      const tone = curveTone(luma, luma);
      expect(tone).toBeGreaterThanOrEqual(previous);
      previous = tone;
    }
  });

  test("an edge brighter than its surround gets lifted", () => {
    expect(curveTone(0.6, 0.4)).toBeGreaterThan(curveTone(0.6, 0.6));
  });
});

describe("poster bitmap", () => {
  test("encodes a 1-bit png of the declared grid", () => {
    const png = Buffer.from(posterBitmap.png, "base64");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(posterGrid.columns);
    expect(png.readUInt32BE(20)).toBe(posterGrid.rows);
    expect(png[24]).toBe(1);
  });

  test("dithers flat mid gray to about half ink", () => {
    const { columns, rows } = posterGrid;
    const gray = new Uint8Array(columns * rows * 3).fill(128);
    const ink = ditherPoster(gray, columns, rows);
    const coverage = ink.reduce((sum, mark) => sum + mark, 0) / ink.length;
    expect(coverage).toBeGreaterThan(0.3);
    expect(coverage).toBeLessThan(0.7);
    expect(encodeInkPng(ink, columns, rows).length).toBeLessThan(2000);
  });
});

describe("lightning", () => {
  test("a strike is at most two pulses inside one second", () => {
    let peaks = 0;
    let previous = 0;
    let rising = false;
    for (let age = 0; age <= 1.5; age += 0.005) {
      const value = flashEnvelope(age);
      expect(value).toBeLessThanOrEqual(1);
      if (value < previous && rising) {
        peaks += 1;
      }
      rising = value > previous;
      previous = value;
    }
    expect(peaks).toBeLessThanOrEqual(2);
    expect(flashEnvelope(1)).toBe(0);
  });

  test("storm strikes stay at least three seconds apart at any frequency", () => {
    for (let frequency = 0; frequency <= 1; frequency += 0.1) {
      expect(nextStrikeGap(0, frequency)).toBeGreaterThanOrEqual(minStrikeGap);
      expect(nextStrikeGap(1, frequency)).toBeGreaterThan(minStrikeGap);
    }
  });

  test("color rises with the strike, holds, then fades back to ink", () => {
    expect(colorEnvelope(-1, 1)).toBe(0);
    expect(colorEnvelope(0.5, 1)).toBe(1);
    expect(colorEnvelope(1.5, 1)).toBeGreaterThan(0);
    expect(colorEnvelope(1.5, 1)).toBeLessThan(1);
    expect(colorEnvelope(3, 1)).toBe(0);
    expect(colorEnvelope(600, Infinity)).toBe(1);
  });
});

const stormSettings: StormSettings = {
  colorLinger: 1,
  frequency: 1,
  intensity: 1,
  isLightning: true,
};

const seededRandom = () => {
  let state = 0.37;
  return () => {
    state = ((state * 9301 + 49_297) % 233_280) / 233_280;
    return state;
  };
};

const runStorm = (mode: StormMode, seconds: number) => {
  const storm = createStorm();
  const step = 1 / 60;
  const random = seededRandom();
  const flashes: number[] = [];
  const colors: number[] = [];
  for (let frame = 0; frame < seconds * 60; frame += 1) {
    advanceStorm(storm, stormSettings, {
      mode,
      random,
      requestedStrikes: frame,
      step,
    });
    flashes.push(storm.flash);
    colors.push(storm.color);
  }
  return { colors, flashes };
};

describe("storm", () => {
  test("reduced motion never flashes or turns to color, even when asked to strike", () => {
    const { colors, flashes } = runStorm("still", 30);
    expect(Math.max(...flashes)).toBe(0);
    expect(Math.max(...colors)).toBe(0);
  });

  test("mashing Strike now stays under three flashes in any second", () => {
    const { flashes } = runStorm("running", 20);
    const onsets: number[] = [];
    for (const [frame, value] of flashes.entries()) {
      if (value >= 0.5 && (flashes[frame - 1] ?? 0) < 0.5) {
        onsets.push(frame / 60);
      }
    }
    expect(onsets.length).toBeGreaterThan(10);
    for (const onset of onsets) {
      const inWindow = onsets.filter(
        (other) => other >= onset && other < onset + 1
      );
      expect(inWindow.length).toBeLessThanOrEqual(2);
    }
    expect(Math.max(...flashes)).toBeLessThanOrEqual(1);
  });

  test("a strike turns the print to color", () => {
    const { colors } = runStorm("running", 3);
    expect(Math.max(...colors)).toBe(1);
  });
});

const imagePath = path.join(
  import.meta.dir,
  "../../../../public/experiments/super-saiyan.jpg"
);

const sampleImage = async () =>
  new Uint8Array(
    await sharp(imagePath)
      .resize(paletteSample.columns, paletteSample.rows, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer()
  );

describe("retro palette", () => {
  test("extraction is deterministic and matches the shipped palette", async () => {
    const rgb = await sampleImage();
    const first = extractPalette(rgb);
    expect(extractPalette(rgb)).toEqual(first);
    expect(retroPalette).toEqual(first);
  });

  test("holds a small fixed set of distinct inks ordered dark to light", () => {
    expect(retroPalette).toHaveLength(retroPaletteSize);
    expect(retroPaletteSize).toBeGreaterThanOrEqual(8);
    expect(retroPaletteSize).toBeLessThanOrEqual(16);
    const keys = new Set(retroPalette.map((color) => color.join(",")));
    expect(keys.size).toBe(retroPalette.length);
    const lumas = retroPalette.map(
      ([red, green, blue]) => 0.2126 * red + 0.7152 * green + 0.0722 * blue
    );
    expect(lumas).toEqual(lumas.toSorted((a, b) => a - b));
  });

  test("a flat image collapses to its one color", () => {
    const flat = new Uint8Array(30 * 3).fill(90);
    expect(extractPalette(flat).length).toBe(1);
  });
});

describe("duotone inks", () => {
  test("each ink is the sRGB value of its site token", async () => {
    const css = await Bun.file(
      path.join(import.meta.dir, "../../../../app/globals.css")
    ).text();
    for (const { rgb, token } of duotoneOptions) {
      const declared = css.match(new RegExp(`${token}:\\s*([^;]+);`, "u"));
      const parsed = parseOklch(declared?.[1] ?? "");
      expect(parsed).not.toBeNull();
      if (parsed) {
        const expected = oklchToSrgb(parsed).map((channel) =>
          Math.round(channel * 255)
        );
        expect(rgb.join(",")).toBe(expected.join(","));
      }
    }
  });
});
