import { shaderMaterial } from "@react-three/drei";
import { Vector2, Vector3 } from "three";
import type { Texture } from "three";

import { revealChunk } from "@/components/lab/source/stage-reveal";

import { retroPalette } from "./retro-palette";
import { inkRgb, paperRgb } from "./settings";
import { toneChunk } from "./tone";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const paletteSize = retroPalette.length;

const fragmentShader = `
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uPalette[${paletteSize}];
  uniform sampler2D uImage;
  uniform vec2 uImageSize;
  uniform float uHasImage;
  uniform sampler2D uBlueNoise;
  uniform float uNoiseSize;
  uniform float uDither;
  uniform float uCell;
  uniform float uThreshold;
  uniform float uContrast;
  uniform float uGamma;
  uniform float uInvert;
  uniform float uTime;
  uniform float uRain;
  uniform float uRainSpeed;
  uniform float uRainSlant;
  uniform float uFlash;
  uniform float uColor;
  uniform float uStrikeSeed;
  uniform vec2 uShake;
  uniform vec2 uAura;
  uniform float uAuraStrength;
  uniform float uAuraReach;
  uniform vec2 uBurst;
  uniform float uBurstAge;

  const vec2 focus = vec2(0.6, 0.6);
  const vec3 lumaWeights = vec3(0.2126, 0.7152, 0.0722);
  const float burstLength = 1.1;
  const float dotPeriod = 3.0;
  const float colorSpread = 0.3;

  ${toneChunk}

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

  vec3 toLinear(vec3 color) {
    return mix(
      color / 12.92,
      pow((color + 0.055) / 1.055, vec3(2.4)),
      step(vec3(0.04045), color)
    );
  }

  vec2 imageSpan() {
    float stageAspect = uResolution.x / uResolution.y;
    float imageAspect = uImageSize.x / uImageSize.y;
    return stageAspect > imageAspect
      ? vec2(1.0, imageAspect / stageAspect)
      : vec2(stageAspect / imageAspect, 1.0);
  }

  float rainAt(vec2 cell, float height) {
    float streak = 0.0;
    for (int layer = 0; layer < 3; layer++) {
      float depth = float(layer);
      float column = cell.x + floor(cell.y * uRainSlant * (1.0 + depth * 0.25));
      float seed = hash(vec2(column, depth * 17.0 + 3.0));
      float isActive = step(0.86 - depth * 0.03, seed);
      float span = 0.55 + seed * 0.6;
      float speed = (0.75 + depth * 0.35 + seed * 0.3) * uRainSpeed;
      float phase = fract((height + uTime * speed) / span + seed * 9.0);
      float streakLength = (0.07 + depth * 0.035) / span;
      float body = step(phase, streakLength) * (0.35 + 0.65 * (1.0 - phase / streakLength));
      streak = max(streak, body * isActive * (1.0 - depth * 0.2));
    }
    return streak;
  }

  float boltPath(vec2 uv, float pixelsPerUv, float seed, float startX, float drift, float top, float bottom) {
    float segment = 0.055;
    float along = (top - uv.y) / segment;
    float index = floor(along);
    float part = fract(along);
    float from = startX + drift * index + (hash(vec2(index, seed)) - 0.5) * 0.07;
    float to = startX + drift * (index + 1.0) + (hash(vec2(index + 1.0, seed)) - 0.5) * 0.07;
    float pathX = mix(from, to, part);
    float gap = abs(uv.x - pathX) * pixelsPerUv / uCell;
    float inside = step(bottom, uv.y) * step(uv.y, top);
    return (1.0 - smoothstep(0.55, 1.3, gap)) * inside;
  }

  float boltAt(vec2 uv, float pixelsPerUv) {
    float seed = uStrikeSeed * 97.0;
    float side = step(0.5, uStrikeSeed);
    float startX = 0.05 + hash(vec2(seed, 2.0)) * 0.26;
    float drift = mix(0.012, -0.012, side) * (0.5 + hash(vec2(seed, 5.0)));
    float bottom = 0.42 + hash(vec2(seed, 9.0)) * 0.16;
    float trunk = boltPath(uv, pixelsPerUv, seed, startX, drift, 1.02, bottom);
    float forkTop = 1.02 - 0.055 * (2.0 + floor(hash(vec2(seed, 13.0)) * 3.0));
    float forkX = startX + drift * (1.02 - forkTop) / 0.055;
    float fork = boltPath(uv, pixelsPerUv, seed + 31.0, forkX, -drift * 2.2, forkTop, forkTop - 0.2);
    return max(trunk, fork * 0.8);
  }

  vec2 halftoneSite(vec2 pixel, float period) {
    const mat2 turn = mat2(0.7071, 0.7071, -0.7071, 0.7071);
    vec2 screen = turn * pixel / period;
    vec2 site = (floor(screen) + 0.5) * period;
    return site * turn;
  }

  float halftoneLevel(vec2 pixel, float period) {
    const mat2 turn = mat2(0.7071, 0.7071, -0.7071, 0.7071);
    vec2 offset = fract(turn * pixel / period) - 0.5;
    return clamp(1.0 - 3.1416 * dot(offset, offset), 0.0, 1.0);
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

  vec3 nearestInk(vec3 color) {
    vec3 best = uPalette[0];
    float bestGap = 1e9;
    for (int index = 0; index < ${paletteSize}; index++) {
      vec3 difference = (color - uPalette[index]) * vec3(0.9, 1.2, 0.7);
      float gap = dot(difference, difference);
      if (gap < bestGap) {
        bestGap = gap;
        best = uPalette[index];
      }
    }
    return best;
  }

  ${revealChunk}

  void main() {
    revealBefore();
    if (uHasImage < 0.5) {
      discard;
    }
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    float isHalftone = step(3.5, uDither);
    float period = uCell * dotPeriod;
    vec2 cell = floor(pixel / uCell);
    vec2 center = mix((cell + 0.5) * uCell, halftoneSite(pixel, period), isHalftone);
    vec2 stage = center / uResolution.y;

    float burstProgress = clamp(uBurstAge / burstLength, 0.0, 1.0);
    float burstLive = step(uBurstAge, burstLength) * step(0.0, uBurstAge);
    float burstRadius = (1.0 - pow(1.0 - burstProgress, 3.0)) * 1.2;
    vec2 burstAway = stage - uBurst / uResolution.y;
    float burstDistance = length(burstAway);
    float fade = pow(1.0 - burstProgress, 1.4) * burstLive;
    float frontOffset = (burstDistance - burstRadius) / 0.03;
    float wakeOffset = (burstDistance - burstRadius + 0.09) / 0.07;
    float front = exp(-frontOffset * frontOffset);
    float wake = exp(-wakeOffset * wakeOffset);
    vec2 shimmer = burstAway / max(burstDistance, 0.001) * (front - wake * 0.5) * fade * 0.018 * uResolution.y;

    vec2 span = imageSpan();
    vec2 start = clamp(focus - span * 0.5, vec2(0.0), vec2(1.0) - span);
    vec2 uv = start + (center + uShake + shimmer) / uResolution * span;
    float pixelsPerUv = uResolution.y / span.y;
    float texelsPerCell = mix(uCell, period * 0.7, isHalftone) * span.y * uImageSize.y / uResolution.y;
    float lod = log2(max(texelsPerCell, 1.0));

    vec3 color = textureLod(uImage, uv, lod).rgb;
    vec3 blurredColor = textureLod(uImage, uv, lod + 2.3).rgb;
    vec3 haloColor = textureLod(uImage, uv, lod + 4.2).rgb;
    float luma = dot(color, lumaWeights);
    float blurred = dot(blurredColor, lumaWeights);
    float tone = curveTone(luma, blurred, uContrast, uGamma);
    vec3 print = curveColor(color, blurredColor, uContrast, uGamma);

    float warmth = color.g / max(color.r, 0.01);
    float hair = smoothstep(0.8, 0.93, warmth) * smoothstep(0.12, 0.3, color.r - color.b) * smoothstep(0.45, 0.7, luma);
    float haloWarmth = haloColor.g / max(haloColor.r, 0.01);
    float hairNear = smoothstep(0.78, 0.92, haloWarmth) * smoothstep(0.08, 0.22, haloColor.r - haloColor.b) * smoothstep(0.3, 0.55, dot(haloColor, lumaWeights));
    float cloth = smoothstep(0.25, 0.45, color.r - color.b) * (1.0 - smoothstep(0.7, 0.82, warmth));
    float sky = (1.0 - hair) * (1.0 - smoothstep(0.08, 0.22, color.r - color.b)) * smoothstep(0.3, 0.75, uv.y);
    float counter = mix(1.0, -1.0, smoothstep(0.3, 0.7, tone));

    float lift = 0.0;
    float rain = rainAt(cell, stage.y) * uRain;
    lift += rain * mix(0.6, -0.4, smoothstep(0.45, 0.75, tone));

    float splashClock = floor(uTime * 9.0 + hash(cell) * 9.0);
    float splash = step(1.0 - 0.025 * uRain, hash(cell + splashClock * vec2(7.0, 13.0)));
    lift += splash * max(hair, cloth) * counter * 0.7;

    float flashLift = uFlash * (0.12 + sky * 0.42 + hair * 0.2);
    float bolt = boltAt(uv, pixelsPerUv) * sky * smoothstep(0.12, 0.45, uFlash);
    lift += bolt * 1.6;

    float auraDistance = length(stage - uAura / uResolution.y);
    float field = exp(-auraDistance * auraDistance * uAuraReach) * uAuraStrength;
    float wide = exp(-auraDistance * auraDistance * uAuraReach * 0.25);
    float ring = smoothstep(0.55, 0.95, sin(auraDistance * 46.0 - uTime * 6.5));
    float breath = 0.5 + 0.5 * sin(uTime * 4.2);
    float flame = valueNoise(vec2(cell.x * 0.12, cell.y * 0.07 - uTime * 2.6));
    float gather = hairNear * (0.2 + 0.8 * wide) * uAuraStrength;
    lift += field * (0.05 + 0.05 * breath);
    lift += gather * (hair * (0.16 + 0.12 * breath) + (1.0 - hair) * smoothstep(0.42, 0.78, flame) * 0.75);
    lift += field * ring * counter * 0.5 * (1.0 - hair);

    lift += fade * (wake * 0.3 + front * counter * 0.9);

    tone += lift + flashLift;
    print += lift + flashLift * 0.6;
    tone = mix(tone, 1.0 - tone, uInvert);
    print = mix(print, 1.0 - print, uInvert);

    float level = orderedLevel(cell);
    level = mix(level, halftoneLevel(pixel, period), isHalftone);

    float reach = tone - uThreshold - level;
    float halftoneEdge = max(fwidth(reach), 0.001);
    float isInk = mix(step(reach, -0.0001), 1.0 - smoothstep(-halftoneEdge, halftoneEdge, reach), isHalftone);

    vec2 local = (pixel - (cell + 0.5) * uCell) / uCell;
    float markScale = mix(1.15, 0.9, smoothstep(4.0, 12.0, uCell)) + field * 0.25;
    float corner = 0.2;
    vec2 markReach = max(abs(local) - (0.5 * markScale - corner), 0.0);
    float distanceToMark = length(markReach) - corner;
    float soft = 0.75 / uCell;
    float mark = mix(1.0 - smoothstep(-soft, soft, distanceToMark), 1.0, isHalftone);

    vec3 mono = mix(uPaper, uInk, isInk * mark);
    vec3 retro = nearestInk(print - uThreshold + (level - 0.5) * colorSpread);
    float colorLevel = bayer8(cell + vec2(3.0, 5.0));
    float isColor = step(colorLevel, uColor);
    vec3 printed = mix(mono, retro, isColor);

    gl_FragColor = vec4(toLinear(printed), 1.0);
    #include <colorspace_fragment>
  }
`;

const noTexture = (): Texture | null => null;

const toVector = ([red, green, blue]: readonly [number, number, number]) =>
  new Vector3(red / 255, green / 255, blue / 255);

const uniforms = {
  uAura: new Vector2(0, 0),
  uAuraReach: 11,
  uAuraStrength: 0,
  uBlueNoise: noTexture(),
  uBurst: new Vector2(0, 0),
  uBurstAge: 10,
  uCell: 3,
  uColor: 0,
  uContrast: 1.35,
  uDither: 2,
  uFlash: 0,
  uGamma: 1,
  uHasImage: 0,
  uImage: noTexture(),
  uImageSize: new Vector2(735, 490),
  uInk: toVector(inkRgb),
  uInvert: 0,
  uNoiseSize: 64,
  uOrigin: new Vector2(0, 0),
  uOriginal: 0,
  uPalette: retroPalette.map(toVector),
  uPaper: toVector(paperRgb),
  uRain: 1,
  uRainSlant: 0.16,
  uRainSpeed: 1,
  uResolution: new Vector2(1, 1),
  uShake: new Vector2(0, 0),
  uStrikeSeed: 0,
  uThreshold: 0,
  uTime: 0,
};

export const SuperSaiyanMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader
);
