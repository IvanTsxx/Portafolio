import { describe, expect, test } from "bun:test";
import path from "node:path";

import sharp from "sharp";

import { blueNoiseRanks } from "./blue-noise";
import { posterBitmap } from "./poster-bitmap";
import { ditherPoster, encodeInkPng, posterGrid } from "./poster-raster";
import { flashEnvelope, nextStrikeGap } from "./storm";
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

  test("strikes stay at least five seconds apart", () => {
    expect(nextStrikeGap(0)).toBeGreaterThanOrEqual(5);
  });
});
