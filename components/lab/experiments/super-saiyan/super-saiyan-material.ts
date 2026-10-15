import { shaderMaterial } from "@react-three/drei";
import { Color, Vector2 } from "three";
import type { Texture } from "three";

import { toneChunk } from "./tone";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform sampler2D uImage;
  uniform vec2 uImageSize;
  uniform float uHasImage;
  uniform sampler2D uBlueNoise;
  uniform float uNoiseSize;
  uniform float uBlue;
  uniform float uCell;
  uniform float uThreshold;
  uniform float uTime;
  uniform float uRain;
  uniform float uFlash;
  uniform vec2 uAura;
  uniform float uAuraStrength;
  uniform vec2 uBurst;
  uniform float uBurstAge;

  const vec2 focus = vec2(0.6, 0.6);
  const vec3 lumaWeights = vec3(0.2126, 0.7152, 0.0722);
  const float burstLength = 1.1;

  ${toneChunk}

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
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
      float column = cell.x + floor(cell.y * (0.16 + depth * 0.04));
      float seed = hash(vec2(column, depth * 17.0 + 3.0));
      float isActive = step(0.86 - depth * 0.03, seed);
      float span = 0.55 + seed * 0.6;
      float speed = 0.75 + depth * 0.35 + seed * 0.3;
      float phase = fract((height + uTime * speed) / span + seed * 9.0);
      float streakLength = (0.07 + depth * 0.035) / span;
      float body = step(phase, streakLength) * (0.35 + 0.65 * (1.0 - phase / streakLength));
      streak = max(streak, body * isActive * (1.0 - depth * 0.2));
    }
    return streak;
  }

  void main() {
    if (uHasImage < 0.5) {
      discard;
    }
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 cell = floor(pixel / uCell);
    vec2 center = (cell + 0.5) * uCell;
    vec2 span = imageSpan();
    vec2 start = clamp(focus - span * 0.5, vec2(0.0), vec2(1.0) - span);
    vec2 uv = start + center / uResolution * span;
    float texelsPerCell = uCell * span.y * uImageSize.y / uResolution.y;
    float lod = log2(max(texelsPerCell, 1.0));

    vec3 color = textureLod(uImage, uv, lod).rgb;
    float luma = dot(color, lumaWeights);
    float blurred = dot(textureLod(uImage, uv, lod + 2.3).rgb, lumaWeights);
    float tone = curveTone(luma, blurred);

    float warmth = color.g / max(color.r, 0.01);
    float hair = smoothstep(0.8, 0.93, warmth) * smoothstep(0.12, 0.3, color.r - color.b) * smoothstep(0.45, 0.7, luma);
    float sky = (1.0 - hair) * (1.0 - smoothstep(0.08, 0.22, color.r - color.b)) * smoothstep(0.3, 0.75, uv.y);

    vec2 stage = center / uResolution.y;
    float rain = rainAt(cell, stage.y) * uRain;
    tone += rain * mix(0.6, -0.4, smoothstep(0.45, 0.75, tone));

    tone += uFlash * (0.14 + sky * 0.6 + hair * 0.2);

    float auraDistance = length(stage - uAura / uResolution.y);
    float field = exp(-auraDistance * auraDistance * 11.0) * uAuraStrength;
    float ring = smoothstep(0.55, 0.95, sin(auraDistance * 46.0 - uTime * 6.5));
    float breath = 0.5 + 0.5 * sin(uTime * 4.2);
    float counter = mix(1.0, -1.0, smoothstep(0.3, 0.7, tone));
    tone += field * (0.16 + hair * 0.3 + 0.1 * breath);
    tone += field * ring * counter * 0.6;

    float burstProgress = clamp(uBurstAge / burstLength, 0.0, 1.0);
    float burstLive = step(uBurstAge, burstLength) * step(0.0, uBurstAge);
    float burstRadius = (1.0 - pow(1.0 - burstProgress, 3.0)) * 1.2;
    float burstDistance = length(stage - uBurst / uResolution.y);
    float fade = pow(1.0 - burstProgress, 1.4) * burstLive;
    float frontOffset = (burstDistance - burstRadius) / 0.03;
    float wakeOffset = (burstDistance - burstRadius + 0.09) / 0.07;
    float front = exp(-frontOffset * frontOffset);
    float wake = exp(-wakeOffset * wakeOffset);
    tone += fade * (wake * 0.3 + front * counter * 0.9);

    float level = mix(bayer8(cell), texture(uBlueNoise, (cell + 0.5) / uNoiseSize).r, uBlue);
    float isInk = step(tone - uThreshold, level - 0.0001);

    vec2 local = (pixel - center) / uCell;
    float markScale = mix(1.15, 0.9, smoothstep(4.0, 12.0, uCell)) + field * 0.25;
    float corner = 0.2;
    vec2 reach = max(abs(local) - (0.5 * markScale - corner), 0.0);
    float distanceToMark = length(reach) - corner;
    float soft = 0.75 / uCell;
    float mark = 1.0 - smoothstep(-soft, soft, distanceToMark);

    gl_FragColor = vec4(mix(uPaper, uInk, isInk * mark), 1.0);
    #include <colorspace_fragment>
  }
`;

const noTexture = (): Texture | null => null;

const uniforms = {
  uAura: new Vector2(0, 0),
  uAuraStrength: 0,
  uBlue: 0,
  uBlueNoise: noTexture(),
  uBurst: new Vector2(0, 0),
  uBurstAge: 10,
  uCell: 3,
  uFlash: 0,
  uHasImage: 0,
  uImage: noTexture(),
  uImageSize: new Vector2(735, 490),
  uInk: new Color("#141414"),
  uNoiseSize: 64,
  uOrigin: new Vector2(0, 0),
  uPaper: new Color("#ededeb"),
  uRain: 1,
  uResolution: new Vector2(1, 1),
  uThreshold: 0,
  uTime: 0,
};

export const SuperSaiyanMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader
);
