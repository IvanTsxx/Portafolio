import { shaderMaterial } from "@react-three/drei";
import type { Texture } from "three";

import { printChunk } from "@/components/lab/source/print-chunk";
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
  uniform sampler2D uNoise;
  uniform float uHasNoise;
  uniform float uDot;
  uniform float uContrast;
  uniform float uInvert;
  uniform float uPhase;
  uniform float uGlow;
  uniform float uPixelRatio;

  ${sourceToneChunk}
  ${printChunk}

  void main() {
    revealBefore();
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec3 ground = mix(uPaper, uInk, uInvert);
    vec3 mark = mix(uInk, uPaper, uInvert);
    if (uHasPortrait < 0.5 || uHasNoise < 0.5) {
      gl_FragColor = vec4(ground, 1.0);
      #include <colorspace_fragment>
      return;
    }
    vec2 cell = floor(pixel / uDot);
    vec2 shift = floor(vec2(hash(vec2(uPhase, 1.3)), hash(vec2(uPhase, 7.9))) * 64.0);
    float threshold = texture2D(uNoise, (mod(cell + shift, 64.0) + 0.5) / 64.0).r;
    vec2 jitter = vec2(hash(cell + shift), hash(cell.yx + shift + 5.1)) - 0.5;
    vec2 center = (cell + 0.5 + jitter * 0.28) * uDot;
    vec2 point = (center - uResolution * 0.5) / uResolution.y;

    float luma = portraitLuma(portraitUv(point), sourceLod(uDot, uResolution));
    luma = clamp((luma - 0.5) * uContrast + 0.5, 0.0, 1.0);
    vec2 toPointer = point - uLight;
    luma += uGlow * exp(-dot(toPointer, toPointer) / 0.02) * 0.45;
    float density = mix(1.0 - luma, luma, uInvert);
    float isOn = step(threshold, density);

    float radius = uDot * 0.34 + uPixelRatio * 0.15;
    float edge = uPixelRatio * 0.6;
    float coverage = isOn * (1.0 - smoothstep(radius - edge, radius + edge, length(pixel - center)));
    gl_FragColor = vec4(mix(ground, mark, coverage), 1.0);
    #include <colorspace_fragment>
  }
`;

interface NoiseUniform {
  uNoise: Texture | null;
}

const noiseUniform: NoiseUniform = { uNoise: null };

export const StippleMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    ...noiseUniform,
    uContrast: 1.2,
    uDot: 3,
    uGlow: 0,
    uHasNoise: 0,
    uInvert: 1,
    uPhase: 0,
    uPixelRatio: 1,
  },
  vertexShader,
  fragmentShader
);
