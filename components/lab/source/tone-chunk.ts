import { Color, Vector2, Vector4 } from "three";
import type { Texture } from "three";

import { revealChunk } from "@/components/lab/source/stage-reveal";

export const sourceToneChunk = `
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uHasPortrait;
  uniform sampler2D uPortrait;
  uniform float uPortraitSize;
  uniform float uPortraitAspect;
  uniform vec2 uPortraitFocus;
  uniform float uAspect;
  uniform vec2 uLight;

  ${revealChunk}

  float portraitLuma(vec2 uv, float lod) {
    return dot(textureLod(uPortrait, uv, lod).rgb, vec3(0.2126, 0.7152, 0.0722));
  }

  vec2 portraitSpan() {
    float cover = max(uAspect, uPortraitAspect);
    return vec2(cover, cover / uPortraitAspect);
  }

  vec2 portraitUv(vec2 point) {
    vec2 span = portraitSpan();
    vec2 visible = vec2(uAspect, 1.0) / span;
    vec2 center = clamp(uPortraitFocus, visible * 0.5, 1.0 - visible * 0.5);
    return point / span + center;
  }

  float portraitInk(vec2 point, float lod) {
    vec2 uv = portraitUv(point);
    float texel = exp2(lod) / uPortraitSize;
    float luma = portraitLuma(uv, lod);
    float slopeX = portraitLuma(uv + vec2(texel, 0.0), lod) - luma;
    float slopeY = portraitLuma(uv + vec2(0.0, texel), lod) - luma;
    vec3 normal = normalize(vec3(-slopeX * 4.0, -slopeY * 4.0, 1.0));
    vec3 toLight = normalize(vec3(uLight - point, 0.6));
    float relight = 0.4 + 0.8 * max(dot(normal, toLight), 0.0);
    float distanceToLight = length(uLight - point);
    float beam = 0.6 + 0.8 * exp(-distanceToLight * distanceToLight * 5.0);
    return clamp(1.0 - luma * relight * beam, 0.0, 1.0);
  }

  float sourceLod(float footprint, vec2 resolution) {
    float texels = footprint * uPortraitSize / (resolution.y * portraitSpan().y);
    return log2(max(texels, 1.0));
  }

  float sourceInk(vec2 point, float lod) {
    return uHasPortrait > 0.5 ? portraitInk(point, lod) : 0.0;
  }
`;

interface SourceUniforms {
  uAspect: number;
  uHasPortrait: number;
  uInk: Color;
  uLight: Vector2;
  uOrigin: Vector2;
  uPaper: Color;
  uPortrait: Texture | null;
  uPortraitAspect: number;
  uPortraitFocus: Vector2;
  uPortraitSize: number;
  uResolution: Vector2;
  uReveal: Vector4;
}

export const createSourceUniforms = (): SourceUniforms => ({
  uAspect: 1,
  uHasPortrait: 0,
  uInk: new Color("#141414"),
  uLight: new Vector2(-0.38, 0.3),
  uOrigin: new Vector2(0, 0),
  uPaper: new Color("#ededeb"),
  uPortrait: null,
  uPortraitAspect: 1,
  uPortraitFocus: new Vector2(0.5, 0.5),
  uPortraitSize: 1,
  uResolution: new Vector2(1, 1),
  uReveal: new Vector4(0, 0, 0, 0),
});

export interface StageImage {
  focus: { x: number; y: number };
  height: number;
  path: string;
  width: number;
}

export const sourceImages = {
  clouds: {
    focus: { x: 0.5, y: 0.5 },
    height: 650,
    path: "/experiments/sources/clouds.jpg",
    width: 488,
  },
  ippo: {
    focus: { x: 0.5, y: 0.3 },
    height: 736,
    path: "/experiments/sources/ippo.jpg",
    width: 736,
  },
  messi: {
    focus: { x: 0.55, y: 0.35 },
    height: 640,
    path: "/experiments/sources/messi.jpg",
    width: 640,
  },
  rocky: {
    focus: { x: 0.55, y: 0.3 },
    height: 1024,
    path: "/experiments/sources/rocky.jpg",
    width: 576,
  },
  vegeta: {
    focus: { x: 0.45, y: 0.42 },
    height: 1024,
    path: "/experiments/sources/vegeta.jpg",
    width: 991,
  },
} as const satisfies Record<string, StageImage>;

export type SourceImage = keyof typeof sourceImages;

export const imageSourceOptions = [
  { label: "Ippo", value: "ippo" },
  { label: "Vegeta", value: "vegeta" },
  { label: "Messi", value: "messi" },
  { label: "Rocky", value: "rocky" },
  { label: "Clouds", value: "clouds" },
] as const satisfies readonly { label: string; value: SourceImage }[];
