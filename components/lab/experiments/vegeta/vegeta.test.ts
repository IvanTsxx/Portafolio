import { describe, expect, test } from "bun:test";
import path from "node:path";

import sharp from "sharp";

import { extractPalette } from "@/components/lab/source/palette";
import { posterGrid } from "@/components/lab/source/write-poster-bitmap";

import { explosionPalette } from "./explosion-palette";
import {
  advanceKi,
  createKi,
  explosionFrame,
  explosionLength,
  rearmAfter,
  restingPulse,
  ringLength,
  ringReach,
} from "./final-explosion";
import type { KiMode } from "./final-explosion";
import { posterBitmap } from "./poster-bitmap";
import { paletteSample, vegetaImage } from "./settings";

const frameStep = 1 / 60;

const runKi = (mode: KiMode, seconds: number, mashing: boolean) => {
  const ki = createKi();
  const frames: { ring: number; color: number; firedAt: number }[] = [];
  for (let frame = 0; frame < seconds * 60; frame += 1) {
    advanceKi(ki, {
      detonations: mashing ? frame : 1,
      mode,
      origin: { x: 0.3, y: 0.7 },
      step: frameStep,
    });
    frames.push({
      color: ki.frame.color,
      firedAt: ki.firedAt,
      ring: ki.frame.ring,
    });
  }
  return { frames, ki };
};

describe("final explosion", () => {
  test("the ring sweeps past the frame before any cell reprints", () => {
    const sweeping = explosionFrame(ringLength * 0.5);
    expect(sweeping.ring).toBeGreaterThan(0);
    expect(sweeping.reprint).toBe(0);
    const swept = explosionFrame(ringLength);
    expect(swept.ring).toBe(ringReach);
    expect(swept.reprint).toBe(0);
    expect(ringReach).toBeGreaterThan(Math.hypot(16 / 10, 1));
  });

  test("the reprint comes back in color, then returns to ink", () => {
    const reprinted = explosionFrame(rearmAfter);
    expect(reprinted.reprint).toBe(1);
    expect(reprinted.color).toBe(1);
    const fading = explosionFrame(explosionLength - 0.3);
    expect(fading.color).toBeGreaterThan(0);
    expect(fading.color).toBeLessThan(1);
    expect(explosionFrame(explosionLength)).toEqual({
      color: 0,
      front: 0,
      reprint: 1,
      ring: 0,
    });
  });

  test("a detonation starts where it was asked for", () => {
    const { ki } = runKi("running", 0.2, false);
    expect(ki.blast).toEqual({ x: 0.3, y: 0.7 });
    expect(ki.frame.ring).toBeGreaterThan(0);
  });

  test("mashing Detonate never bleaches the frame twice in a second", () => {
    const { frames } = runKi("running", 20, true);
    const onsets = [...new Set(frames.map((frame) => frame.firedAt))];
    expect(onsets.length).toBeGreaterThan(5);
    for (const [index, onset] of onsets.entries()) {
      const next = onsets[index + 1];
      if (next !== undefined) {
        expect(next - onset).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("reduced motion never detonates or prints in color, even when asked", () => {
    const { frames, ki } = runKi("still", 10, true);
    expect(Math.max(...frames.map((frame) => frame.ring))).toBe(0);
    expect(Math.max(...frames.map((frame) => frame.color))).toBe(0);
    expect(ki.pulse).toBe(restingPulse);
  });

  test("the Majin mark pulses between rest and full", () => {
    const ki = createKi();
    const pulses: number[] = [];
    for (let frame = 0; frame < 180; frame += 1) {
      advanceKi(ki, {
        detonations: 0,
        mode: "running",
        origin: { x: 0.5, y: 0.5 },
        step: frameStep,
      });
      pulses.push(ki.pulse);
    }
    expect(Math.min(...pulses)).toBeLessThan(0.05);
    expect(Math.max(...pulses)).toBeGreaterThan(0.95);
    expect(Math.max(...pulses)).toBeLessThanOrEqual(1);
  });
});

describe("vegeta assets", () => {
  test("the poster is a 1-bit png of the shared poster grid", () => {
    const png = Buffer.from(posterBitmap.png, "base64");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(posterGrid.columns);
    expect(png.readUInt32BE(20)).toBe(posterGrid.rows);
    expect(png[24]).toBe(1);
  });

  test("the shipped explosion inks match a median cut of the image", async () => {
    const rgb = await sharp(
      path.join(import.meta.dir, "../../../../public", vegetaImage.path)
    )
      .resize(paletteSample.columns, paletteSample.rows, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer();
    expect(explosionPalette).toEqual(extractPalette(new Uint8Array(rgb)));
    expect(new Set(explosionPalette.map((ink) => ink.join(","))).size).toBe(
      explosionPalette.length
    );
  });
});
