import { Vector3 } from "three";

import type { Rgb } from "@/components/lab/source/palette";

export const orderedDitherOptions = [
  { label: "2×2", value: "bayer-2" },
  { label: "4×4", value: "bayer-4" },
  { label: "8×8", value: "bayer-8" },
  { label: "Blue", value: "blue-noise" },
] as const;

export type OrderedDither = (typeof orderedDitherOptions)[number]["value"];

export const orderedDitherIndex = (mode: OrderedDither) =>
  orderedDitherOptions.findIndex((option) => option.value === mode);

export const inkRgb: Rgb = [0x14, 0x14, 0x14];
export const paperRgb: Rgb = [0xed, 0xed, 0xeb];

export const rgbVector = ([red, green, blue]: Rgb) =>
  new Vector3(red / 255, green / 255, blue / 255);

export const orderedPrintChunk = `
  uniform sampler2D uBlueNoise;
  uniform float uNoiseSize;
  uniform float uDither;

  const vec3 lumaWeights = vec3(0.2126, 0.7152, 0.0722);

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float valueNoise(vec2 point) {
    vec2 whole = floor(point);
    vec2 part = fract(point);
    vec2 blend = part * part * (3.0 - 2.0 * part);
    return mix(
      mix(hash(whole), hash(whole + vec2(1.0, 0.0)), blend.x),
      mix(hash(whole + vec2(0.0, 1.0)), hash(whole + vec2(1.0, 1.0)), blend.x),
      blend.y
    );
  }

  float bayer2(vec2 cell) {
    cell = floor(cell);
    return fract(cell.x / 2.0 + cell.y * cell.y * 0.75);
  }

  float bayer4(vec2 cell) {
    return bayer2(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float bayer8(vec2 cell) {
    return bayer4(0.5 * cell) * 0.25 + bayer2(cell) + 0.5 / 64.0;
  }

  float orderedLevel(vec2 cell) {
    if (uDither < 0.5) {
      return bayer2(cell) + 0.125;
    }
    if (uDither < 1.5) {
      return bayer4(cell) + 0.5 / 16.0;
    }
    if (uDither < 2.5) {
      return bayer8(cell);
    }
    return texture(uBlueNoise, (cell + 0.5) / uNoiseSize).r;
  }

  vec3 toLinear(vec3 color) {
    return mix(
      color / 12.92,
      pow((color + 0.055) / 1.055, vec3(2.4)),
      step(vec3(0.04045), color)
    );
  }

  vec2 imageSpan(vec2 resolution, vec2 imageSize) {
    float stageAspect = resolution.x / resolution.y;
    float imageAspect = imageSize.x / imageSize.y;
    return stageAspect > imageAspect
      ? vec2(1.0, imageAspect / stageAspect)
      : vec2(stageAspect / imageAspect, 1.0);
  }
`;

export const nearestInkChunk = (size: number) => `
  uniform vec3 uPalette[${size}];

  vec3 nearestInk(vec3 color) {
    vec3 best = uPalette[0];
    float bestGap = 1e9;
    for (int index = 0; index < ${size}; index++) {
      vec3 difference = (color - uPalette[index]) * vec3(0.9, 1.2, 0.7);
      float gap = dot(difference, difference);
      if (gap < bestGap) {
        bestGap = gap;
        best = uPalette[index];
      }
    }
    return best;
  }
`;
