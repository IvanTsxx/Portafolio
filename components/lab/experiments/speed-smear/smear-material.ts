import { shaderMaterial } from "@react-three/drei";

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
  uniform float uSmear;
  uniform float uAngle;
  uniform float uReach;
  uniform float uCell;
  uniform float uDither;
  uniform float uKick;

  ${sourceToneChunk}
  ${printChunk}

  const int taps = 32;

  void main() {
    revealBefore();
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 point = (pixel - uResolution * 0.5) / uResolution.y;
    if (uHasPortrait < 0.5) {
      gl_FragColor = vec4(uPaper, 1.0);
      #include <colorspace_fragment>
      return;
    }
    vec2 along = vec2(cos(uAngle), sin(uAngle));
    vec2 across = vec2(-along.y, along.x);
    vec2 away = point - uLight;
    float reachAlong = dot(away, along) / (uReach * 1.6);
    float reachAcross = dot(away, across) / uReach;
    float mask = exp(-reachAlong * reachAlong - reachAcross * reachAcross);
    float streak = floor(dot(point, across) * uResolution.y / (uCell * 3.0));
    float streakLength = 0.45 + 1.1 * hash(vec2(streak, 3.7));
    float smear = (uSmear + uKick * 0.18) * mask * streakLength;
    float lod = sourceLod(1.0, uResolution);
    float blurLod = lod + clamp(smear * 30.0, 0.0, 2.5);
    float total = 0.0;
    for (int tap = 0; tap < taps; tap++) {
      float offset = float(tap) / float(taps - 1) - 0.5;
      total += portraitLuma(portraitUv(point + along * offset * smear), blurLod);
    }
    float luma = total / float(taps);
    luma += (hash(vec2(streak, 9.1)) - 0.5) * 0.12 * mask * min(smear * 12.0, 1.0);
    float ink = smoothstep(0.04, 0.96, 1.0 - luma);
    float printed = step(bayer8(pixel / uCell), ink);
    gl_FragColor = vec4(mix(uPaper, uInk, mix(ink, printed, uDither)), 1.0);
    #include <colorspace_fragment>
  }
`;

export const SmearMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uAngle: 0,
    uCell: 2,
    uDither: 1,
    uKick: 0,
    uReach: 0.16,
    uSmear: 0.12,
  },
  vertexShader,
  fragmentShader
);
