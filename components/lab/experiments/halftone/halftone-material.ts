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
  uniform float uCell;
  uniform float uAngle;
  uniform float uMark;

  ${sourceToneChunk}

  float dotRadius(float coverage) {
    if (coverage <= 0.7854) {
      return sqrt(coverage / 3.14159265);
    }
    return 0.5 + 0.2071 * pow((coverage - 0.7854) / 0.2146, 2.5);
  }

  float markInk(vec2 local, float coverage, float soft) {
    if (uMark < 0.5) {
      float radius = dotRadius(coverage);
      return 1.0 - smoothstep(radius - soft, radius + soft, length(local));
    }
    if (uMark < 1.5) {
      float halfWidth = coverage * 0.5;
      return 1.0 - smoothstep(halfWidth - soft, halfWidth + soft, abs(local.y));
    }
    float halfSide = sqrt(coverage) * 0.5;
    return 1.0 - smoothstep(halfSide - soft, halfSide + soft, max(abs(local.x), abs(local.y)));
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 center = uResolution * 0.5;
    float sine = sin(uAngle);
    float cosine = cos(uAngle);
    mat2 toScreen = mat2(cosine, -sine, sine, cosine);
    mat2 toPixel = mat2(cosine, sine, -sine, cosine);
    vec2 screen = toScreen * (pixel - center) / uCell;
    vec2 base = floor(screen - 0.5);
    float soft = 0.75 / uCell;
    float lod = sourceLod(uCell, uResolution);
    bool isLine = uMark > 0.5 && uMark < 1.5;
    float ink = 0.0;
    for (int column = 0; column <= 1; column++) {
      for (int row = 0; row <= 1; row++) {
        vec2 cellCenter = base + vec2(float(column), float(row)) + 0.5;
        vec2 sampleAt = isLine ? vec2(screen.x, cellCenter.y) : cellCenter;
        vec2 samplePixel = toPixel * sampleAt * uCell;
        float coverage = sourceInk(samplePixel / uResolution.y, lod);
        ink = max(ink, markInk(screen - cellCenter, coverage, soft));
      }
    }
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const HalftoneMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uAngle: Math.PI / 4,
    uCell: 10,
    uMark: 0,
  },
  vertexShader,
  fragmentShader
);
