import { Color, ShaderMaterial, Vector2, Vector3 } from "three";
import type { IUniform, Texture } from "three";

import { blueNoiseSize } from "@/registry/ivan/lib/blue-noise";
import {
  createImageCoverUniforms,
  fullscreenVertexShader,
  imageCoverChunk,
} from "@/registry/ivan/lib/image-cover";
import type { ImageCoverUniforms } from "@/registry/ivan/lib/image-cover";
import {
  nearestInkChunk,
  orderedChunk,
  orderedDithers,
} from "@/registry/ivan/lib/ordered-print";
import type { OrderedDither } from "@/registry/ivan/lib/ordered-print";
import { paletteSize } from "@/registry/ivan/lib/palette";
import {
  bayerChunk,
  hashChunk,
  valueNoiseChunk,
} from "@/registry/ivan/lib/print-noise";
import {
  printSeparation,
  toneChunk,
  toneSeparationChunk,
} from "@/registry/ivan/lib/tone-curve";

export const stormDithers = [...orderedDithers, "halftone"] as const;

export type StormDither = OrderedDither | "halftone";

export const stormDitherIndex = (mode: StormDither) =>
  stormDithers.indexOf(mode);

export const stormPrintDefaults = {
  aura: 1,
  auraRadius: 1,
  cell: 3,
  colorHold: 1.2,
  contrast: 1.35,
  dither: "bayer-8",
  flash: 1,
  frequency: 0.5,
  ink: "#0B0B0C",
  lightning: true,
  paper: "#EDECE8",
  paused: false,
  print: "ink",
  rain: 1,
  rainAngle: 9,
  rainSpeed: 1,
  strikes: 0,
  threshold: 0,
} as const;

export interface StormPrintUniforms extends ImageCoverUniforms {
  uAura: IUniform<Vector2>;
  uAuraSize: IUniform<number>;
  uAuraStrength: IUniform<number>;
  uBlueNoise: IUniform<Texture | null>;
  uBurst: IUniform<Vector2>;
  uBurstAge: IUniform<number>;
  uCell: IUniform<number>;
  uColor: IUniform<number>;
  uContrast: IUniform<number>;
  uDither: IUniform<number>;
  uFlash: IUniform<number>;
  uInk: IUniform<Color>;
  uLanding: IUniform<Vector2>;
  uNoiseSize: IUniform<number>;
  uPaper: IUniform<Color>;
  uPalette: IUniform<Vector3[]>;
  uRain: IUniform<number>;
  uRainSlant: IUniform<number>;
  uRainSpeed: IUniform<number>;
  uShake: IUniform<Vector2>;
  uStrikeSeed: IUniform<number>;
  uThreshold: IUniform<number>;
  uTime: IUniform<number>;
}

const fragmentShader = `
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uCell;
  uniform float uThreshold;
  uniform float uContrast;
  uniform float uTime;
  uniform float uRain;
  uniform float uRainSpeed;
  uniform float uRainSlant;
  uniform float uFlash;
  uniform float uColor;
  uniform float uStrikeSeed;
  uniform vec2 uLanding;
  uniform vec2 uShake;
  uniform vec2 uAura;
  uniform float uAuraStrength;
  uniform float uAuraSize;
  uniform vec2 uBurst;
  uniform float uBurstAge;

  const float burstLength = 0.7;
  const float dotPeriod = 3.0;
  const float colorSpread = 0.3;
  const float tileCells = 6.0;
  const float boltSegment = 0.055;

  ${imageCoverChunk}
  ${hashChunk}
  ${valueNoiseChunk}
  ${bayerChunk}
  ${orderedChunk}
  ${toneChunk}
  ${nearestInkChunk(paletteSize)}

  ${toneSeparationChunk("crispTone", printSeparation)}

  float rainAt(vec2 cell, float height) {
    float streak = 0.0;
    for (int layer = 0; layer < 3; layer++) {
      float depth = float(layer);
      float column = cell.x + floor(cell.y * uRainSlant * (1.0 + depth * 0.25));
      float seed = hash(vec2(column, depth * 17.0 + 3.0));
      float isActive = step(0.9 - depth * 0.025, seed);
      float span = 0.55 + seed * 0.6;
      float speed = (0.85 + depth * 0.35 + seed * 0.3) * uRainSpeed;
      float phase = fract((height + uTime * speed) / span + seed * 9.0);
      float streakLength = (0.06 + depth * 0.03) / span;
      float body = step(phase, streakLength) * step(0.35, 1.0 - phase / streakLength);
      streak = max(streak, body * isActive * (1.0 - depth * 0.25));
    }
    return streak;
  }

  float boltPath(vec2 point, float seed, float startX, float drift, float top, float bottom) {
    float along = (top - point.y) / boltSegment;
    float index = floor(along);
    float part = fract(along);
    float from = startX + drift * index + (hash(vec2(index, seed)) - 0.5) * 0.05;
    float to = startX + drift * (index + 1.0) + (hash(vec2(index + 1.0, seed)) - 0.5) * 0.05;
    float pathX = mix(from, to, part);
    float gap = abs(point.x - pathX) * uResolution.y / uCell;
    float inside = step(bottom, point.y) * step(point.y, top);
    return step(gap, 1.1) * inside;
  }

  float boltAt(vec2 point) {
    float seed = uStrikeSeed * 97.0;
    float top = 1.02;
    float aspect = uResolution.x / uResolution.y;
    float landX = uLanding.x * aspect;
    float steps = max((top - uLanding.y) / boltSegment, 1.0);
    float startX = landX + (hash(vec2(seed, 2.0)) - 0.5) * 0.3;
    float drift = (landX - startX) / steps;
    float trunk = boltPath(point, seed, startX, drift, top, uLanding.y);
    float forkTop = top - boltSegment * (2.0 + floor(hash(vec2(seed, 13.0)) * 3.0));
    float forkX = startX + drift * (top - forkTop) / boltSegment;
    float forkDrift = (hash(vec2(seed, 5.0)) - 0.5) * 0.06;
    float fork = boltPath(point, seed + 31.0, forkX, forkDrift, forkTop, forkTop - 0.22);
    return max(trunk, fork);
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

  void main() {
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
    float burstRadius = (1.0 - exp2(-7.0 * burstProgress)) * 0.9;
    vec2 burstAway = stage - uBurst / uResolution.y;
    float burstDistance = length(burstAway);
    float fade = (1.0 - burstProgress) * (1.0 - burstProgress) * burstLive;
    float frontOffset = (burstDistance - burstRadius) / 0.022;
    float front = exp(-frontOffset * frontOffset) * fade;
    vec2 shimmer = burstAway / max(burstDistance, 0.001) * front * 0.012 * uResolution.y;

    vec2 uv = coverUv((center + uShake + shimmer) / uResolution);
    float lod = imageLod(mix(uCell, period * 0.7, isHalftone));

    vec3 color = textureLod(uImage, uv, lod).rgb;
    vec3 blurredColor = textureLod(uImage, uv, lod + 2.3).rgb;
    vec3 haloColor = textureLod(uImage, uv, lod + 4.2).rgb;
    float luma = dot(color, lumaWeights);
    float blurred = dot(blurredColor, lumaWeights);
    float tone = crispTone(curveTone(luma, blurred, uContrast, 1.0));
    vec3 print = curveColor(color, blurredColor, uContrast, 1.0);

    float darkness = 1.0 - smoothstep(0.12, 0.5, dot(haloColor, lumaWeights));
    float counter = mix(1.0, -1.0, smoothstep(0.35, 0.65, tone));

    float lift = 0.0;
    lift += rainAt(cell, stage.y) * uRain * darkness * 0.75;

    lift += uFlash * (0.08 + darkness * 0.5);
    lift += boltAt(center / uResolution * vec2(uResolution.x / uResolution.y, 1.0)) * step(0.12, uFlash) * counter * 2.0;

    vec2 fromAura = stage - uAura / uResolution.y;
    float above = step(0.0, fromAura.y);
    vec2 shaped = vec2(fromAura.x * 1.2, fromAura.y * mix(1.0, 0.42, above)) / max(uAuraSize, 0.001);
    float heat = exp(-dot(shaped, shaped) * 1.4) * uAuraStrength;
    float tongue = valueNoise(vec2(cell.x * 0.14, cell.y * 0.032 - uTime * 3.6));
    float flicker = valueNoise(vec2(cell.x * 0.33, cell.y * 0.09 - uTime * 7.0));
    float flame = step(1.0 - heat * 0.95, tongue * 0.78 + flicker * 0.22);
    float core = step(1.0 - heat * 0.6, tongue * 0.78 + flicker * 0.22);
    lift += flame * darkness * (0.95 + 0.4 * core);

    lift += front * counter * 1.2;

    tone += lift;
    print += lift * 0.6;

    float level = orderedLevel(cell);
    level = mix(level, halftoneLevel(pixel, period), isHalftone);

    float reach = tone - uThreshold - level;
    float halftoneEdge = max(fwidth(reach), 0.001);
    float isInk = mix(step(reach, -0.0001), 1.0 - smoothstep(-halftoneEdge, halftoneEdge, reach), isHalftone);

    vec3 mono = mix(uPaper, uInk, isInk);
    vec3 retro = toLinear(nearestInk(print - uThreshold + (level - 0.5) * colorSpread));

    vec2 tile = floor(cell / tileCells);
    vec2 tileStage = (tile + 0.5) * tileCells * uCell / uResolution.y;
    vec2 landing = uLanding * vec2(uResolution.x / uResolution.y, 1.0);
    float diagonal = length(vec2(uResolution.x / uResolution.y, 1.0));
    float order = clamp(length(tileStage - landing) / diagonal * 0.82 + hash(tile + 11.0) * 0.18, 0.0, 1.0);
    float isColor = step(order, uColor) * step(0.001, uColor);

    gl_FragColor = vec4(mix(mono, retro, isColor), 1.0);
    #include <colorspace_fragment>
  }
`;

const createUniforms = (): StormPrintUniforms => ({
  ...createImageCoverUniforms(),
  uAura: { value: new Vector2(0, 0) },
  uAuraSize: { value: 0.22 },
  uAuraStrength: { value: 0 },
  uBlueNoise: { value: null },
  uBurst: { value: new Vector2(0, 0) },
  uBurstAge: { value: 10 },
  uCell: { value: stormPrintDefaults.cell },
  uColor: { value: 0 },
  uContrast: { value: stormPrintDefaults.contrast },
  uDither: { value: stormDitherIndex(stormPrintDefaults.dither) },
  uFlash: { value: 0 },
  uInk: { value: new Color(stormPrintDefaults.ink) },
  uLanding: { value: new Vector2(0.5, 0.5) },
  uNoiseSize: { value: blueNoiseSize },
  uPalette: {
    value: Array.from({ length: paletteSize }, () => new Vector3()),
  },
  uPaper: { value: new Color(stormPrintDefaults.paper) },
  uRain: { value: stormPrintDefaults.rain },
  uRainSlant: { value: 0.16 },
  uRainSpeed: { value: stormPrintDefaults.rainSpeed },
  uShake: { value: new Vector2(0, 0) },
  uStrikeSeed: { value: 0 },
  uThreshold: { value: stormPrintDefaults.threshold },
  uTime: { value: 0 },
});

export class StormPrintMaterial extends ShaderMaterial {
  declare uniforms: StormPrintUniforms;

  constructor() {
    super({
      depthTest: false,
      depthWrite: false,
      fragmentShader,
      toneMapped: false,
      uniforms: createUniforms(),
      vertexShader: fullscreenVertexShader,
    });
  }
}
