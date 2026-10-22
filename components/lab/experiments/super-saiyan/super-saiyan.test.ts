import { describe, expect, test } from "bun:test";
import path from "node:path";

import sharp from "sharp";

import { extractPalette, paletteSize } from "@/components/lab/source/palette";
import { parseOklch, oklchToSrgb } from "@/lib/design-system/color";

import { posterBitmap } from "./poster-bitmap";
import { paletteSample, posterGrid } from "./poster-raster";
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

describe("poster bitmap", () => {
  test("encodes a 1-bit png of the declared grid", () => {
    const png = Buffer.from(posterBitmap.png, "base64");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(posterGrid.columns);
    expect(png.readUInt32BE(20)).toBe(posterGrid.rows);
    expect(png[24]).toBe(1);
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
    expect(retroPalette).toHaveLength(paletteSize);
    expect(paletteSize).toBeGreaterThanOrEqual(8);
    expect(paletteSize).toBeLessThanOrEqual(16);
    const keys = new Set(retroPalette.map((color) => color.join(",")));
    expect(keys.size).toBe(retroPalette.length);
    const lumas = retroPalette.map(
      ([red, green, blue]) => 0.2126 * red + 0.7152 * green + 0.0722 * blue
    );
    expect(lumas).toEqual(lumas.toSorted((a, b) => a - b));
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
