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
  uniform float uCurvature;
  uniform float uLines;
  uniform float uBand;
  uniform float uTime;
  uniform float uWobble;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  ${sourceToneChunk}

  const float screenInset = 1.08;
  const float slotAspect = 0.55;

  vec2 degauss(vec2 pixel) {
    vec2 away = pixel - uPointer;
    float reach = length(away) / uResolution.y;
    float ripple = sin(reach * 42.0 - uTime * 16.0) * exp(-reach * 3.2) * uWobble;
    vec2 radial = away / max(length(away), 1.0);
    vec2 swirl = vec2(-radial.y, radial.x);
    return (swirl * 0.03 + radial * 0.018) * ripple;
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 halfSize = uResolution * 0.5;
    vec2 uv = (pixel - halfSize) / halfSize * screenInset + degauss(pixel);
    float bend = 1.0 + uCurvature;
    vec2 screen = uv * (1.0 + uCurvature * dot(uv, uv)) / bend;
    float edge = min(1.0 - abs(screen.x), 1.0 - abs(screen.y));
    float bezel = 1.5 * uPixelRatio / halfSize.y;
    if (edge < 0.0) {
      float rim = 1.0 - smoothstep(bezel * 0.5, bezel, abs(edge + bezel));
      gl_FragColor = vec4(mix(uPaper, uInk, rim), 1.0);
      #include <colorspace_fragment>
      return;
    }

    float rowHeight = uResolution.y / uLines;
    float columnWidth = rowHeight * slotAspect;
    vec2 screenPixel = (screen * 0.5 + 0.5) * uResolution;
    float column = floor(screenPixel.x / columnWidth);
    float stagger = mod(column, 2.0) * 0.5;
    float row = floor(screenPixel.y / rowHeight + stagger);
    vec2 local = vec2(
      fract(screenPixel.x / columnWidth) - 0.5,
      fract(screenPixel.y / rowHeight + stagger) - 0.5
    );
    vec2 slotCenter = vec2((column + 0.5) * columnWidth, (row + 0.5 - stagger) * rowHeight);

    float sweep = mix(-0.15, 1.15, fract(uBand));
    float height01 = slotCenter.y / uResolution.y;
    float band = exp(-pow((height01 - sweep) / 0.07, 2.0));
    slotCenter.x += band * columnWidth * 1.4;

    float lod = sourceLod(rowHeight, uResolution);
    float tone = sourceInk((slotCenter - halfSize) / uResolution.y, lod);
    float corner = dot(screen, screen);
    tone = clamp(tone * (1.0 - 0.5 * band) + 0.22 * smoothstep(0.6, 2.0, corner), 0.0, 1.0);

    float halfHeight = 0.46 * sqrt(tone);
    float halfWidth = 0.36;
    vec2 soft = vec2(0.75 / columnWidth, 0.75 / rowHeight);
    float across = 1.0 - smoothstep(halfWidth - soft.x, halfWidth + soft.x, abs(local.x));
    float along = 1.0 - smoothstep(halfHeight - soft.y, halfHeight + soft.y, abs(local.y));
    float ink = tone > 0.02 ? across * along : 0.0;
    float rim = 1.0 - smoothstep(bezel * 0.5, bezel, edge);
    gl_FragColor = vec4(mix(uPaper, uInk, max(ink, rim)), 1.0);
    #include <colorspace_fragment>
  }
`;

export const CrtMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uBand: 0,
    uCurvature: 0.12,
    uLines: 96,
    uPixelRatio: 1,
    uPointer: new Vector2(0, 0),
    uTime: 0,
    uWobble: 0,
  },
  vertexShader,
  fragmentShader
);
