import { shaderMaterial } from "@react-three/drei";
import { Color, Vector2, Vector4 } from "three";
import type { Texture } from "three";

import { atlasWidth, rowHeight } from "./stamp-atlas";
import { maxImpressions } from "./stamp-pad";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  #define MAX_IMPRESSIONS ${maxImpressions}
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uPixelRatio;
  uniform float uStampHeight;
  uniform sampler2D uAtlas;
  uniform int uCount;
  uniform vec4 uPlacement[MAX_IMPRESSIONS];
  uniform vec4 uPress[MAX_IMPRESSIONS];

  const float rows = ${maxImpressions.toFixed(1)};
  const float rowAspect = ${(atlasWidth / rowHeight).toFixed(4)};

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float valueNoise(vec2 point) {
    vec2 base = floor(point);
    vec2 offset = fract(point);
    vec2 blend = offset * offset * (3.0 - 2.0 * offset);
    float a = hash(base);
    float b = hash(base + vec2(1.0, 0.0));
    float c = hash(base + vec2(0.0, 1.0));
    float d = hash(base + vec2(1.0, 1.0));
    return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
  }

  float fractalNoise(vec2 point) {
    return valueNoise(point) * 0.55 + valueNoise(point * 2.1 + 7.3) * 0.3 + valueNoise(point * 4.3 + 1.7) * 0.15;
  }

  float impressionInk(vec2 pixel, vec4 placement, vec4 press, int slot, float tooth) {
    float aspect = placement.w;
    float height = min(uStampHeight * uResolution.y, 0.86 * uResolution.x / aspect);
    vec2 size = vec2(height * aspect, height);
    float sine = sin(placement.z);
    float cosine = cos(placement.z);
    vec2 offset = pixel - placement.xy * uResolution;
    vec2 local = mat2(cosine, -sine, sine, cosine) * offset;
    vec2 uv = local / size + 0.5;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
      return 0.0;
    }
    float ink = press.x;
    float seed = press.y;
    float progress = press.z;
    float wear = press.w;
    vec2 atlasUv = vec2(uv.x * aspect / rowAspect, 1.0 - (float(slot) + 1.0 - uv.y) / rows);
    vec2 rubber = local / height;
    float edgeNoise = valueNoise(rubber * 38.0 + seed) - 0.5;
    float glyph = texture2D(uAtlas, atlasUv).r + edgeNoise * wear * 0.7;
    float halo = textureLod(uAtlas, atlasUv, 2.5).r;
    float contact = smoothstep(0.42 + wear * 0.12, 0.6 + wear * 0.12, glyph);
    float rim = clamp(contact - halo, 0.0, 1.0);
    float pressure = fractalNoise(rubber * 3.2 + seed * 1.7);
    float density = ink * mix(0.55, 1.2, pressure) + rim * 0.45;
    float printed = smoothstep(tooth - 0.16, tooth + 0.16, density);
    float chips = valueNoise(rubber * 14.0 + seed * 3.1);
    printed *= smoothstep(wear * 0.55 - 0.04, wear * 0.55 + 0.04, chips);
    float bloom = smoothstep(0.0, 1.0, progress * 1.6 - (1.0 - pressure) * 0.6);
    return contact * printed * bloom * 0.94;
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 cssPixel = pixel / uPixelRatio;
    float tooth = fractalNoise(cssPixel * 0.85) * 0.8 + valueNoise(cssPixel * 2.4) * 0.2;
    float fiber = valueNoise(vec2(cssPixel.x * 0.03, cssPixel.y * 0.7));
    float covered = 0.0;
    for (int slot = 0; slot < MAX_IMPRESSIONS; slot++) {
      if (slot >= uCount) {
        break;
      }
      float ink = impressionInk(pixel, uPlacement[slot], uPress[slot], slot, tooth);
      covered = 1.0 - (1.0 - covered) * (1.0 - ink);
    }
    float paperTone = smoothstep(0.55, 1.0, fiber) * 0.05 + smoothstep(0.7, 1.0, tooth) * 0.03;
    gl_FragColor = vec4(mix(uPaper, uInk, clamp(paperTone + covered, 0.0, 1.0)), 1.0);
    #include <colorspace_fragment>
  }
`;

const placements = () =>
  Array.from({ length: maxImpressions }, () => new Vector4(0, 0, 0, 1));

interface StampUniforms {
  uAtlas: Texture | null;
  uCount: number;
  uInk: Color;
  uOrigin: Vector2;
  uPaper: Color;
  uPixelRatio: number;
  uPlacement: Vector4[];
  uPress: Vector4[];
  uResolution: Vector2;
  uStampHeight: number;
}

const createStampUniforms = (): StampUniforms => ({
  uAtlas: null,
  uCount: 0,
  uInk: new Color("#141414"),
  uOrigin: new Vector2(0, 0),
  uPaper: new Color("#ededeb"),
  uPixelRatio: 1,
  uPlacement: placements(),
  uPress: placements(),
  uResolution: new Vector2(1, 1),
  uStampHeight: 0.2,
});

export const StampMaterial = shaderMaterial(
  { ...createStampUniforms() },
  vertexShader,
  fragmentShader
);
