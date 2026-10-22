import { Color, Vector2 } from "three";
import type { Texture } from "three";

export const sourceToneChunk = `
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uSource;
  uniform float uHasPortrait;
  uniform sampler2D uPortrait;
  uniform float uPortraitSize;
  uniform float uPortraitAspect;
  uniform vec2 uPortraitFocus;
  uniform float uAspect;
  uniform vec2 uLight;

  const vec2 formCenter = vec2(0.0, 0.04);
  const float formRadius = 0.34;
  const float groundLine = -0.37;

  float formInk(vec2 point) {
    vec2 offset = point - formCenter;
    float reach = dot(offset, offset);
    if (reach < formRadius * formRadius) {
      float depth = sqrt(formRadius * formRadius - reach);
      vec3 normal = vec3(offset, depth) / formRadius;
      vec3 toLight = normalize(vec3(uLight - point, 0.75 - depth));
      float diffuse = max(dot(normal, toLight), 0.0);
      float specular = pow(max(dot(reflect(-toLight, normal), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
      return clamp(0.94 - 0.74 * diffuse - 0.55 * specular, 0.0, 1.0);
    }
    vec2 shadowCenter = vec2(formCenter.x - (uLight.x - formCenter.x) * 0.45, groundLine);
    vec2 shadowScale = vec2(formRadius + abs(uLight.x) * 0.12, 0.07);
    float shadow = 1.0 - smoothstep(0.55, 1.15, length((point - shadowCenter) / shadowScale));
    shadow *= smoothstep(-0.4, 0.1, uLight.y);
    float falloff = smoothstep(0.15, 1.3, length(uLight - point));
    return clamp(0.02 + 0.2 * falloff + 0.55 * shadow, 0.0, 1.0);
  }

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
    if (uSource > 0.5 && uHasPortrait > 0.5) {
      return portraitInk(point, lod);
    }
    return formInk(point);
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
  uSource: number;
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
  uSource: 0,
});

export const sourceImages = {
  clouds: {
    focus: { x: 0.5, y: 0.5 },
    path: "/experiments/sources/clouds.jpg",
  },
  ippo: { focus: { x: 0.5, y: 0.3 }, path: "/experiments/sources/ippo.jpg" },
  messi: {
    focus: { x: 0.55, y: 0.35 },
    path: "/experiments/sources/messi.jpg",
  },
  rocky: { focus: { x: 0.55, y: 0.3 }, path: "/experiments/sources/rocky.jpg" },
  vegeta: {
    focus: { x: 0.45, y: 0.42 },
    path: "/experiments/sources/vegeta.jpg",
  },
} as const;

export type SourceImage = keyof typeof sourceImages;

export type SourceKind = "form" | SourceImage;

export const imageSourceOptions = [
  { label: "Ippo", value: "ippo" },
  { label: "Vegeta", value: "vegeta" },
  { label: "Messi", value: "messi" },
  { label: "Rocky", value: "rocky" },
  { label: "Clouds", value: "clouds" },
] as const satisfies readonly { label: string; value: SourceImage }[];

export const sourceOptions = [
  { label: "Form", value: "form" },
  ...imageSourceOptions,
] as const satisfies readonly { label: string; value: SourceKind }[];
