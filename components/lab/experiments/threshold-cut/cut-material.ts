import { shaderMaterial } from "@react-three/drei";
import { Vector2 } from "three";

import {
  createSourceUniforms,
  sourceToneChunk,
} from "@/components/lab/source/tone-chunk";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uThreshold;
  uniform float uRoughness;
  uniform float uPhase;
  uniform float uPush;
  uniform vec2 uPointer;

  ${sourceToneChunk}

  float hash(vec2 cell) {
    return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 blend = fract(point);
    blend = blend * blend * (3.0 - 2.0 * blend);
    float bottom = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), blend.x);
    float top = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), blend.x);
    return mix(bottom, top, blend.y);
  }

  const mat2 gougeTurn = mat2(0.866, 0.5, -0.5, 0.866);

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 point = (pixel - uResolution * 0.5) / uResolution.y;
    float tone = sourceInk(point, sourceLod(3.0, uResolution));

    float chips = valueNoise(point * 22.0) * 0.6 + valueNoise(point * 57.0) * 0.4 - 0.5;
    float gouge = valueNoise(gougeTurn * point * vec2(140.0, 9.0)) - 0.5;
    float grain = (chips * 0.38 + gouge * 0.14) * uRoughness;

    float sweep = 0.13 * sin(uPhase + point.x * 2.2 - point.y * 1.1);
    vec2 fromPointer = (pixel - uPointer) / uResolution.y;
    float push = uPush * 0.3 * exp(-dot(fromPointer, fromPointer) / 0.035);
    float cut = tone + grain - (uThreshold + sweep - push);

    float edge = max(fwidth(cut), 0.0001);
    float ink = smoothstep(-edge, edge, cut);
    float speck = step(1.0 - 0.1 * uRoughness, valueNoise(point * 260.0));
    ink *= 1.0 - speck * smoothstep(0.0, 0.08, cut);
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const CutMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uPhase: 0,
    uPointer: new Vector2(0, 0),
    uPush: 0,
    uRoughness: 0.45,
    uThreshold: 0.5,
  },
  vertexShader,
  fragmentShader
);
