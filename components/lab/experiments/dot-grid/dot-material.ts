import { shaderMaterial } from "@react-three/drei";
import { Vector2 } from "three";

import {
  createSourceUniforms,
  sourceToneChunk,
} from "@/components/lab/source/tone-chunk";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uCell;
  uniform float uLensRadius;
  uniform float uLensStrength;
  uniform float uSquare;
  uniform float uPixelRatio;
  uniform vec2 uLens;
  varying vec2 vUv;

  ${sourceToneChunk}

  float toneAt(vec2 center) {
    vec2 point = (center - uResolution * 0.5) / uResolution.y;
    return smoothstep(0.05, 0.95, sourceInk(point, sourceLod(uCell, uResolution)));
  }

  float coverage(vec2 pixel, vec2 cell) {
    vec2 center = (cell + 0.5) * uCell;
    vec2 away = center - uLens;
    float distanceToLens = length(away);
    float lensDistance = distanceToLens / uLensRadius;
    float falloff = exp(-lensDistance * lensDistance) * uLensStrength;
    vec2 direction = distanceToLens > 0.001 ? away / distanceToLens : vec2(0.0);
    vec2 dotCenter = center + direction * falloff * uCell * 0.6;

    float tone = toneAt(center);
    float radius = uCell * 0.5 * clamp(0.12 + tone * 0.78 + falloff * 0.55, 0.0, 1.35);

    vec2 offset = pixel - dotCenter;
    float reach = mix(length(offset), max(abs(offset.x), abs(offset.y)), uSquare);
    float edge = uPixelRatio * 0.75;
    return 1.0 - smoothstep(radius - edge, radius + edge, reach);
  }

  void main() {
    revealBefore();
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 cell = floor(pixel / uCell);
    float ink = 0.0;
    for (int column = -1; column <= 1; column++) {
      for (int row = -1; row <= 1; row++) {
        ink = max(ink, coverage(pixel, cell + vec2(float(column), float(row))));
      }
    }
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const DotMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uCell: 12,
    uLens: new Vector2(0, 0),
    uLensRadius: 120,
    uLensStrength: 0,
    uPixelRatio: 1,
    uSquare: 0,
  },
  vertexShader,
  fragmentShader
);
