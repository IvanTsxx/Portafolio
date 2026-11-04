import { describe, expect, test } from "bun:test";
import path from "node:path";

import sharp from "sharp";
import { NearestFilter, RepeatWrapping } from "three";

import { blueNoiseBytes } from "@/components/lab/source/blue-noise";
import { BlastPrintMaterial } from "@/registry/ivan/components/blast-print/blast-print-material";
import {
  advanceBlast,
  blastFrame,
  blastLength,
  createBlast,
  idleFrame,
  rearmAfter,
  ringLength,
  ringReach,
} from "@/registry/ivan/components/blast-print/blast-timeline";
import type { BlastMode } from "@/registry/ivan/components/blast-print/blast-timeline";
import { SignalTearMaterial } from "@/registry/ivan/components/signal-tear/signal-tear-material";
import { SpeedSmearMaterial } from "@/registry/ivan/components/speed-smear/speed-smear-material";
import {
  StormPrintMaterial,
  stormDitherIndex,
  stormDithers,
} from "@/registry/ivan/components/storm-print/storm-print-material";
import {
  advanceStorm,
  colorEnvelope,
  createStorm,
  flashEnvelope,
  minStrikeGap,
  nextStrikeGap,
} from "@/registry/ivan/components/storm-print/storm-timeline";
import type {
  StormMode,
  StormSettings,
} from "@/registry/ivan/components/storm-print/storm-timeline";
import {
  blueNoiseSize,
  createBlueNoiseTexture,
} from "@/registry/ivan/lib/blue-noise";
import {
  centeredFocus,
  createImageCoverUniforms,
  setCoverImage,
} from "@/registry/ivan/lib/image-cover";
import {
  orderedDitherIndex,
  orderedDithers,
} from "@/registry/ivan/lib/ordered-print";
import { extractPalette, paletteSize } from "@/registry/ivan/lib/palette";
import { PointerLight, restingLight } from "@/registry/ivan/lib/pointer-light";
import { toneChunk, toneCurve } from "@/registry/ivan/lib/tone-curve";

const frameStep = 1 / 60;

describe("storm lightning", () => {
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
  colorHold: 1,
  flash: 1,
  frequency: 1,
  lightning: true,
};

const seededRandom = () => {
  let state = 0.37;
  return () => {
    state = ((state * 9301 + 49_297) % 233_280) / 233_280;
    return state;
  };
};

const runStorm = (
  mode: StormMode,
  seconds: number,
  settings: StormSettings = stormSettings
) => {
  const storm = createStorm();
  const random = seededRandom();
  const flashes: number[] = [];
  const colors: number[] = [];
  for (let frame = 0; frame < seconds * 60; frame += 1) {
    advanceStorm(storm, settings, {
      isRequested: true,
      mode,
      random,
      step: frameStep,
    });
    flashes.push(storm.flash);
    colors.push(storm.color);
  }
  return { colors, flashes };
};

describe("storm", () => {
  test("a still frame never flashes or turns to color, even when asked to strike", () => {
    const { colors, flashes } = runStorm("still", 30);
    expect(Math.max(...flashes)).toBe(0);
    expect(Math.max(...colors)).toBe(0);
  });

  test("mashing strike stays under three flashes in any second", () => {
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
        (other) => other >= onset && other < onset + 1 - 1e-6
      );
      expect(inWindow.length).toBeLessThanOrEqual(2);
    }
    expect(Math.max(...flashes)).toBeLessThanOrEqual(1);
  });

  test("a strike turns the print to color", () => {
    const { colors } = runStorm("running", 3);
    expect(Math.max(...colors)).toBe(1);
  });

  test("without a request, storm strikes wait for the timer and stay off when lightning is off", () => {
    const storm = createStorm();
    for (let frame = 0; frame < 20 * 60; frame += 1) {
      advanceStorm(
        storm,
        { ...stormSettings, lightning: false },
        {
          isRequested: false,
          mode: "running",
          random: Math.random,
          step: frameStep,
        }
      );
    }
    expect(storm.strikeAt).toBe(-Infinity);
    expect(storm.color).toBe(0);
  });
});

const runBlast = (mode: BlastMode, seconds: number) => {
  const blast = createBlast();
  const frames: { ring: number; color: number; firedAt: number }[] = [];
  for (let frame = 0; frame < seconds * 60; frame += 1) {
    advanceBlast(blast, {
      mode,
      request: { x: 0.3, y: 0.7 },
      step: frameStep,
    });
    frames.push({
      color: blast.frame.color,
      firedAt: blast.firedAt,
      ring: blast.frame.ring,
    });
  }
  return { blast, frames };
};

describe("blast", () => {
  test("the ring sweeps past the frame before any cell reprints", () => {
    const sweeping = blastFrame(ringLength * 0.5);
    expect(sweeping.ring).toBeGreaterThan(0);
    expect(sweeping.reprint).toBe(0);
    const swept = blastFrame(ringLength);
    expect(swept.ring).toBe(ringReach);
    expect(swept.reprint).toBe(0);
    expect(ringReach).toBeGreaterThan(Math.hypot(16 / 10, 1));
  });

  test("the reprint comes back in color, then returns to ink", () => {
    const reprinted = blastFrame(rearmAfter);
    expect(reprinted.reprint).toBe(1);
    expect(reprinted.color).toBe(1);
    const fading = blastFrame(blastLength - 0.3);
    expect(fading.color).toBeGreaterThan(0);
    expect(fading.color).toBeLessThan(1);
    expect(blastFrame(blastLength)).toEqual(idleFrame);
  });

  test("a detonation starts where it was asked for", () => {
    const blast = createBlast();
    advanceBlast(blast, {
      mode: "running",
      request: { x: 0.3, y: 0.7 },
      step: frameStep,
    });
    advanceBlast(blast, { mode: "running", request: null, step: 0.1 });
    expect(blast.origin).toEqual({ x: 0.3, y: 0.7 });
    expect(blast.frame.ring).toBeGreaterThan(0);
  });

  test("mashing never bleaches the frame twice in a second", () => {
    const { frames } = runBlast("running", 20);
    const onsets = [...new Set(frames.map((frame) => frame.firedAt))];
    expect(onsets.length).toBeGreaterThan(5);
    for (const [index, onset] of onsets.entries()) {
      const next = onsets[index + 1];
      if (next !== undefined) {
        expect(next - onset).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("a still frame never detonates or prints in color, even when asked", () => {
    const { frames } = runBlast("still", 10);
    expect(Math.max(...frames.map((frame) => frame.ring))).toBe(0);
    expect(Math.max(...frames.map((frame) => frame.color))).toBe(0);
  });
});

describe("median cut palette", () => {
  test("a flat image collapses to its one color", () => {
    const flat = new Uint8Array(30 * 3).fill(90);
    expect(extractPalette(flat)).toHaveLength(1);
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

  test("a varied image yields a deterministic set of distinct inks ordered dark to light", () => {
    const rgb = new Uint8Array(64 * 64 * 3);
    for (let index = 0; index < 64 * 64; index += 1) {
      rgb[index * 3] = (index * 7) % 256;
      rgb[index * 3 + 1] = (index * 13) % 256;
      rgb[index * 3 + 2] = (index * 29) % 256;
    }
    const palette = extractPalette(rgb);
    expect(extractPalette(rgb)).toEqual(palette);
    expect(palette).toHaveLength(paletteSize);
    expect(new Set(palette.map((ink) => ink.join(","))).size).toBe(
      palette.length
    );
    const lumas = palette.map(
      ([red, green, blue]) => 0.2126 * red + 0.7152 * green + 0.0722 * blue
    );
    expect(lumas).toEqual(lumas.toSorted((a, b) => a - b));
  });
});

describe("blue noise tile", () => {
  test("holds 256 levels, 16 cells each, and matches the png the poster scripts write", async () => {
    const texture = createBlueNoiseTexture();
    const bytes = Uint8Array.from(texture.image.data ?? []);
    texture.dispose();
    expect(bytes).toHaveLength(blueNoiseSize * blueNoiseSize);
    const counts = new Map<number, number>();
    for (const level of bytes) {
      counts.set(level, (counts.get(level) ?? 0) + 1);
    }
    expect(counts.size).toBe(256);
    expect(new Set(counts.values())).toEqual(new Set([16]));
    const png = await sharp(
      path.join(process.cwd(), "public/experiments/blue-noise-64.png")
    )
      .extractChannel(0)
      .raw()
      .toBuffer();
    expect([...bytes]).toEqual([...png]);
    expect([...bytes]).toEqual([...blueNoiseBytes(blueNoiseSize)]);
  });

  test("repeats and reads texels unfiltered", () => {
    const texture = createBlueNoiseTexture();
    texture.dispose();
    expect(texture.wrapS).toBe(RepeatWrapping);
    expect(texture.wrapT).toBe(RepeatWrapping);
    expect(texture.magFilter).toBe(NearestFilter);
    expect(texture.minFilter).toBe(NearestFilter);
  });
});

describe("ordered print", () => {
  test("shader dither indexes follow the order of the branches", () => {
    expect(orderedDithers.map(orderedDitherIndex)).toEqual([0, 1, 2, 3]);
    expect(stormDithers.map(stormDitherIndex)).toEqual([0, 1, 2, 3, 4]);
    expect(stormDithers.at(-1)).toBe("halftone");
  });

  test("the tone curve chunk carries the shared table", () => {
    expect(toneChunk).toContain(toneCurve.detail.toFixed(4));
    expect(toneChunk).toContain(toneCurve.black.toFixed(4));
  });
});

describe("shaders", () => {
  const materials = {
    blast: new BlastPrintMaterial(),
    signalTear: new SignalTearMaterial(),
    speedSmear: new SpeedSmearMaterial(),
    storm: new StormPrintMaterial(),
  };

  test("every fragment shader is fully interpolated", () => {
    for (const [name, material] of Object.entries(materials)) {
      expect(material.fragmentShader, name).not.toContain("undefined");
      expect(material.fragmentShader, name).not.toContain("[object");
      expect(material.fragmentShader, name).toContain("void main()");
    }
  });

  test("the cover uniforms flip the focus into texture space", () => {
    const uniforms = createImageCoverUniforms();
    const texture = createBlueNoiseTexture();
    setCoverImage(
      uniforms,
      { height: 400, texture, width: 800 },
      { x: 0.25, y: 0.1 }
    );
    texture.dispose();
    expect(uniforms.uHasImage.value).toBe(1);
    expect(uniforms.uImageSize.value.toArray()).toEqual([800, 400]);
    expect(uniforms.uFocus.value.toArray()).toEqual([0.25, 0.9]);
    setCoverImage(uniforms, null, centeredFocus);
    expect(uniforms.uHasImage.value).toBe(0);
  });
});

const settle = (
  light: PointerLight,
  pointer: { x: number; y: number },
  seconds: number,
  isAnimating: boolean
) => {
  for (let frame = 0; frame < seconds * 60; frame += 1) {
    light.advance(pointer, frameStep, isAnimating);
  }
};

describe("pointer light", () => {
  test("follows the pointer once it moves, then drifts on its own after it rests", () => {
    const light = new PointerLight();
    light.advance({ x: 0.2, y: 0.2 }, frameStep, true);
    settle(light, { x: -0.6, y: -0.4 }, 1, true);
    expect(light.x).toBeCloseTo((-0.6 + 1) / 2, 1);
    expect(light.y).toBeCloseTo((-0.4 + 1) / 2, 1);
    settle(light, { x: -0.6, y: -0.4 }, 6, true);
    expect(Math.abs(light.x - (-0.6 + 1) / 2)).toBeGreaterThan(0.05);
  });

  test("a held frame rests at the starting light and jumps to a moved pointer", () => {
    const light = new PointerLight();
    settle(light, { x: 0, y: 0 }, 0.5, false);
    expect(light.x).toBe(restingLight.x);
    expect(light.y).toBe(restingLight.y);
    expect(light.kick).toBe(0);
    light.advance({ x: 0.5, y: 0.5 }, frameStep, false);
    expect(light.x).toBeCloseTo(0.75, 5);
    expect(light.y).toBeCloseTo(0.75, 5);
  });

  test("a fast pointer kicks and the kick decays", () => {
    const light = new PointerLight();
    let angle = 0;
    for (let frame = 0; frame < 30; frame += 1) {
      angle += 0.9;
      light.advance(
        { x: Math.sin(angle), y: Math.cos(angle) },
        frameStep,
        true
      );
    }
    const peak = light.kick;
    expect(peak).toBeGreaterThan(0.2);
    settle(light, { x: Math.sin(angle), y: Math.cos(angle) }, 4, true);
    expect(light.kick).toBeLessThan(peak);
  });
});
