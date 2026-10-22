import { shaderMaterial } from "@react-three/drei";
import { Texture, Vector2 } from "three";

import {
  createSourceUniforms,
  sourceToneChunk,
} from "@/components/lab/source/tone-chunk";

import { atlasColumns, atlasTexels, glyphDots } from "./glyph-atlas";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uPitch;
  uniform float uTrail;
  uniform float uPixelRatio;
  uniform float uLensRadius;
  uniform float uLensStrength;
  uniform float uGlyphStart;
  uniform float uGlyphCount;
  uniform float uAtlasColumns;
  uniform vec2 uAtlasTexels;
  uniform vec2 uGlyphDots;
  uniform vec2 uLens;
  uniform sampler2D uAtlas;
  varying vec2 vUv;

  ${sourceToneChunk}

  float hash(float seed) {
    return fract(sin(seed * 91.3458) * 47453.5453);
  }

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
    return bayer4(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float drop(vec2 cell, float rows, float layer) {
    float seed = cell.x * 1.618 + layer * 17.31;
    float speed = mix(4.0, 13.0, hash(seed));
    float span = rows + uTrail + hash(seed + 3.1) * rows * 1.5;
    float head = floor(mod(uTime * speed + hash(seed + 7.7) * span, span));
    float behind = head - cell.y;
    if (behind < 0.0 || behind >= uTrail) {
      return 0.0;
    }
    return behind < 0.5 ? 1.0 : pow(1.0 - behind / uTrail, 1.6) * 0.82;
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 dotCell = floor(pixel / uPitch);
    vec2 center = (dotCell + 0.5) * uPitch;

    vec2 away = center - uLens;
    float spread = exp(-dot(away, away) / (uLensRadius * uLensRadius))
      * uLensStrength * uLensRadius * 0.55;
    float ink = 0.0;

    if (abs(away.x) >= spread) {
      float sourceX = uLens.x + sign(away.x) * (abs(away.x) - spread);
      vec2 fromTop = vec2(sourceX, uResolution.y - center.y);
      vec2 cellSize = uGlyphDots * uPitch;
      vec2 cell = floor(fromTop / cellSize);
      vec2 inCell = min(floor(fract(fromTop / cellSize) * uGlyphDots), uGlyphDots - 1.0);
      float rows = ceil(uResolution.y / cellSize.y);
      float intensity = max(drop(cell, rows, 0.0), drop(cell, rows, 1.0));
      if (uHasPortrait > 0.5) {
        vec2 point = (center - uResolution * 0.5) / uResolution.y;
        float picture = smoothstep(0.2, 0.8, sourceInk(point, sourceLod(uPitch, uResolution)));
        intensity = max(intensity * (0.2 + 0.8 * picture), picture * 0.8);
      }

      if (intensity > 0.0) {
        float flicker = floor(uTime * mix(1.5, 7.0, hash(cell.x + 41.0)) + hash(cell) * 9.0);
        float glyph = uGlyphStart + floor(hash(cell + flicker * 0.731) * uGlyphCount);
        vec2 tile = vec2(mod(glyph, uAtlasColumns), floor(glyph / uAtlasColumns));
        vec2 texel = tile * uGlyphDots + inCell + 0.5;
        float mark = texture2D(uAtlas, texel / uAtlasTexels).r;
        float tone = smoothstep(0.12, 0.55, mark) * intensity;
        if (tone > bayer8(dotCell)) {
          float radius = uPitch * mix(0.3, 0.46, intensity);
          float edge = uPixelRatio * 0.6;
          ink = 1.0 - smoothstep(radius - edge, radius + edge, length(pixel - center));
        }
      }
    }

    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const RainMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uAtlas: new Texture(),
    uAtlasColumns: atlasColumns,
    uAtlasTexels: new Vector2(atlasTexels.width, atlasTexels.height),
    uGlyphCount: 2,
    uGlyphDots: new Vector2(glyphDots.columns, glyphDots.rows),
    uGlyphStart: 0,
    uLens: new Vector2(0, 0),
    uLensRadius: 110,
    uLensStrength: 0,
    uPitch: 3,
    uPixelRatio: 1,
    uTime: 0,
    uTrail: 12,
  },
  vertexShader,
  fragmentShader
);
