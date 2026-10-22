import { describe, expect, test } from "bun:test";
import path from "node:path";

import sharp from "sharp";

import { blueNoiseRanks } from "@/components/lab/source/blue-noise";
import { extractPalette } from "@/components/lab/source/palette";
import { encodeInkPng } from "@/components/lab/source/poster-png";
import {
  curveTone,
  ditherPrint,
  rgbLuma,
} from "@/components/lab/source/print-tone";

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
      "../../../public/experiments/blue-noise-64.png"
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

describe("dither print", () => {
  test("dithers flat mid gray to about half ink in a small png", () => {
    const columns = 180;
    const rows = 120;
    const gray = new Uint8Array(columns * rows * 3).fill(128);
    const ink = ditherPrint(rgbLuma(gray), columns, rows);
    const coverage = ink.reduce((sum, mark) => sum + mark, 0) / ink.length;
    expect(coverage).toBeGreaterThan(0.3);
    expect(coverage).toBeLessThan(0.7);
    expect(encodeInkPng(ink, columns, rows).length).toBeLessThan(2000);
  });

  test("white paper stays blank and black prints solid", () => {
    const white = ditherPrint(new Float32Array(64).fill(1), 8, 8);
    const black = ditherPrint(new Float32Array(64).fill(0), 8, 8);
    expect(Math.max(...white)).toBe(0);
    expect(Math.min(...black)).toBe(1);
  });
});

describe("median cut palette", () => {
  test("a flat image collapses to its one color", () => {
    const flat = new Uint8Array(30 * 3).fill(90);
    expect(extractPalette(flat).length).toBe(1);
  });

  test("a two-color image keeps both colors apart", () => {
    const pixels = Array.from({ length: 40 }, (_, index) =>
      index % 2 ? [220, 40, 30] : [20, 60, 200]
    ).flat();
    const palette = extractPalette(Uint8Array.from(pixels), 2);
    expect(palette).toHaveLength(2);
    const [dark, light] = palette;
    expect(dark?.[2]).toBeGreaterThan(dark?.[0] ?? 0);
    expect(light?.[0]).toBeGreaterThan(light?.[2] ?? 0);
  });
});
