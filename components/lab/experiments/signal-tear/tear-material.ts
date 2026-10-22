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
  uniform float uTime;
  uniform float uTear;
  uniform float uGrain;
  uniform float uGhost;
  uniform float uKick;
  uniform float uPixelRatio;

  ${sourceToneChunk}
  ${printChunk}

  const int ghostTaps = 12;

  float lumaAt(vec2 point, float lod) {
    return portraitLuma(portraitUv(point), lod);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 point = (pixel - uResolution * 0.5) / uResolution.y;
    if (uHasPortrait < 0.5) {
      gl_FragColor = vec4(uPaper, 1.0);
      #include <colorspace_fragment>
      return;
    }
    float frame = floor(uTime * 12.0);
    float burst = floor(uTime * 3.0);
    float row = pixel.y / uPixelRatio;
    float bandHeight = mix(4.0, 42.0, hash(vec2(floor(row / 42.0), burst)));
    float band = floor(row / bandHeight);
    float pointerRows = (point.y - uLight.y) / 0.16;
    float nearPointer = exp(-pointerRows * pointerRows);
    float odds = 0.12 + 0.55 * uTear * nearPointer + 0.5 * uKick;
    float isTorn = step(1.0 - odds, hash(vec2(band, burst + 0.37)));
    float shift = (hash(vec2(band, frame)) - 0.5) * isTorn;
    shift *= (0.03 + 0.22 * uTear) * (0.5 + nearPointer + uKick);
    float jitter = (hash(vec2(floor(row), frame)) - 0.5) * 0.006 * uTear;
    vec2 torn = point - vec2(shift + jitter, 0.0);

    float lod = sourceLod(1.0, uResolution);
    float luma = lumaAt(torn, lod);
    float trail = luma;
    float reach = 0.09 * uGhost * (0.6 + nearPointer + uKick);
    for (int tap = 1; tap <= ghostTaps; tap++) {
      float along = float(tap) / float(ghostTaps);
      float ghost = lumaAt(torn - vec2(along * reach, 0.0), lod + 1.0);
      trail = max(trail, ghost * (1.0 - along * 0.85));
    }
    luma = mix(luma, trail, 0.7 * uGhost);

    vec2 fromCenter = point / vec2(max(uAspect, 1.0) * 0.5, 0.5);
    luma *= 1.0 - 0.32 * dot(fromCenter, fromCenter);
    luma = smoothstep(0.03, 0.88, luma);

    vec2 grainCell = floor(pixel / max(uPixelRatio, 1.0));
    float grain = hash(grainCell + vec2(frame * 17.0, frame * 31.0)) - 0.5;
    grain += hash(floor(grainCell * 0.5) + vec2(frame * 7.0, 3.0)) - 0.5;
    luma += grain * uGrain * 0.42;

    float ink = clamp(1.0 - luma, 0.0, 1.0);
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const TearMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uGhost: 0.6,
    uGrain: 0.6,
    uKick: 0,
    uPixelRatio: 1,
    uTear: 0.5,
    uTime: 0,
  },
  vertexShader,
  fragmentShader
);
