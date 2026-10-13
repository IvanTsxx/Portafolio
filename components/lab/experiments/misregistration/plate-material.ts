import { shaderMaterial } from "@react-three/drei";
import { Color, Vector2 } from "three";

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
  uniform float uDrift;
  uniform float uPlates;
  uniform float uTime;
  uniform float uPresence;
  uniform float uReach;
  uniform vec2 uPointer;
  uniform vec3 uGraphite;
  uniform vec3 uMist;

  ${sourceToneChunk}

  const float plateAngles[3] = float[3](0.7854, 0.2618, 1.309);
  const float plateTravel[3] = float[3](0.45, 1.0, 1.0);

  float dotRadius(float coverage) {
    if (coverage <= 0.7854) {
      return sqrt(coverage / 3.14159265);
    }
    return 0.5 + 0.2071 * pow((coverage - 0.7854) / 0.2146, 2.5);
  }

  float plateCoverage(float tone, int plate) {
    if (plate == 0) {
      return smoothstep(0.42, 1.0, tone);
    }
    if (plate == 1) {
      return tone * 0.72;
    }
    return tone * 0.5;
  }

  float plateInk(vec2 pixel, int plate, float lod) {
    float angle = plateAngles[plate];
    float sine = sin(angle);
    float cosine = cos(angle);
    mat2 toScreen = mat2(cosine, -sine, sine, cosine);
    mat2 toPixel = mat2(cosine, sine, -sine, cosine);
    vec2 screen = toScreen * (pixel - uResolution * 0.5) / uCell;
    vec2 base = floor(screen - 0.5);
    float soft = 0.75 / uCell;
    float ink = 0.0;
    for (int column = 0; column <= 1; column++) {
      for (int row = 0; row <= 1; row++) {
        vec2 cellCenter = base + vec2(float(column), float(row)) + 0.5;
        vec2 samplePixel = toPixel * cellCenter * uCell;
        float coverage = plateCoverage(sourceInk(samplePixel / uResolution.y, lod), plate);
        if (coverage > 0.01) {
          float radius = dotRadius(coverage);
          ink = max(ink, 1.0 - smoothstep(radius - soft, radius + soft, length(screen - cellCenter)));
        }
      }
    }
    return ink;
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 fromPointer = (pixel - uPointer) / uReach;
    float registered = uPresence * exp(-dot(fromPointer, fromPointer));
    float spread = uDrift * (1.0 - registered) * (0.85 + 0.15 * sin(uTime * 0.5));
    float lod = sourceLod(uCell, uResolution);
    vec3 color = uPaper;
    for (int plate = 0; plate < 3; plate++) {
      if (float(plate) >= uPlates) {
        break;
      }
      float seed = float(plate);
      float heading = seed * 2.0944 + 0.6 + 0.35 * sin(uTime * 0.23 + seed * 1.7);
      vec2 shift = vec2(cos(heading), sin(heading)) * spread * plateTravel[plate];
      float ink = plateInk(pixel - shift, plate, lod);
      vec3 tint = plate == 0 ? uInk : (plate == 1 ? uGraphite : uMist);
      color *= mix(vec3(1.0), tint / uPaper, ink);
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const PlateMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uCell: 9,
    uDrift: 8,
    uGraphite: new Color("#3e3f3c"),
    uMist: new Color("#646462"),
    uPlates: 3,
    uPointer: new Vector2(0, 0),
    uPresence: 0,
    uReach: 200,
    uTime: 0,
  },
  vertexShader,
  fragmentShader
);
