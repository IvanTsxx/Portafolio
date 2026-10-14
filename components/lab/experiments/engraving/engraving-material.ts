import { shaderMaterial } from "@react-three/drei";

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
  uniform float uPitch;
  uniform float uAngle;
  uniform float uFollow;

  ${sourceToneChunk}

  const float crossShare = 0.62;
  const float crossTurn = 1.0471976;
  const float hairline = 0.05;
  const float bulge = 0.14;

  float reliefAt(vec2 point, float lod) {
    if (uSource > 0.5 && uHasPortrait > 0.5) {
      vec2 uv = point / max(uAspect, 1.0) + 0.5;
      return portraitLuma(uv, lod + 3.0);
    }
    vec2 offset = point - formCenter;
    return max(1.0 - dot(offset, offset) / (formRadius * formRadius), 0.0);
  }

  float lineInk(vec2 pixel, float angle, float shift, float lineWidth) {
    vec2 normal = vec2(-sin(angle), cos(angle));
    float across = dot(pixel, normal) / uPitch + shift;
    float blur = max(fwidth(across), 0.0001);
    float distanceToLine = abs(fract(across) - 0.5);
    return clamp((lineWidth * 0.5 - distanceToLine) / blur + 0.5, 0.0, 1.0);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin - uResolution * 0.5;
    vec2 point = pixel / uResolution.y;
    float lod = sourceLod(uPitch, uResolution);
    float tone = sourceInk(point, lod);
    float shift = uFollow * reliefAt(point, lod) * bulge * uResolution.y / uPitch;
    float primaryWidth = mix(hairline, crossShare, min(tone / crossShare, 1.0));
    float crossWidth = max(tone - crossShare, 0.0) / (1.0 - crossShare);
    float primary = lineInk(pixel, uAngle, shift, primaryWidth);
    float crossing = lineInk(pixel, uAngle + crossTurn, shift, crossWidth);
    float ink = max(primary, crossing * step(0.001, crossWidth));
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const EngravingMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uAngle: Math.PI / 6,
    uFollow: 0.7,
    uPitch: 6,
  },
  vertexShader,
  fragmentShader
);
