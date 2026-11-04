import { Color, ShaderMaterial, Vector2 } from "three";
import type { IUniform } from "three";

import {
  createImageCoverUniforms,
  fullscreenVertexShader,
  imageCoverChunk,
} from "@/registry/ivan/lib/image-cover";
import type { ImageCoverUniforms } from "@/registry/ivan/lib/image-cover";
import { bayerChunk, hashChunk } from "@/registry/ivan/lib/print-noise";
import {
  toneChunk,
  toneCurve,
  toneSeparationChunk,
} from "@/registry/ivan/lib/tone-curve";
import type { ToneSeparation } from "@/registry/ivan/lib/tone-curve";

export const speedSmearDefaults = {
  angle: 0,
  cell: 2,
  dither: true,
  ink: "#0B0B0C",
  paper: "#EDECE8",
  paused: false,
  reach: 0.16,
  smear: 0.12,
} as const;

export interface SpeedSmearUniforms extends ImageCoverUniforms {
  uAngle: IUniform<number>;
  uCell: IUniform<number>;
  uDither: IUniform<number>;
  uInk: IUniform<Color>;
  uKick: IUniform<number>;
  uLight: IUniform<Vector2>;
  uPaper: IUniform<Color>;
  uReach: IUniform<number>;
  uSmear: IUniform<number>;
}

const glslFloat = (value: number) => value.toFixed(4);

export const smearSeparation: ToneSeparation = {
  amount: 0.8,
  high: 0.8,
  low: 0.2,
};

const fragmentShader = `
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec2 uLight;
  uniform float uSmear;
  uniform float uAngle;
  uniform float uReach;
  uniform float uCell;
  uniform float uDither;
  uniform float uKick;

  const float printContrast = ${glslFloat(toneCurve.contrast)};

  ${imageCoverChunk}
  ${hashChunk}
  ${bayerChunk}
  ${toneChunk}

  const int taps = 32;

  ${toneSeparationChunk("crispTone", smearSeparation)}

  void main() {
    if (uHasImage < 0.5) {
      discard;
    }
    float aspect = uResolution.x / uResolution.y;
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 point = (pixel - uResolution * 0.5) / uResolution.y;
    vec2 along = vec2(cos(uAngle), sin(uAngle));
    vec2 across = vec2(-along.y, along.x);
    vec2 away = point - uLight;
    float reachAlong = dot(away, along) / (uReach * 1.6);
    float reachAcross = dot(away, across) / uReach;
    float mask = exp(-reachAlong * reachAlong - reachAcross * reachAcross);
    float streak = floor(dot(point, across) * uResolution.y / (uCell * 3.0));
    float streakLength = 0.45 + 1.1 * hash(vec2(streak, 3.7));
    float smear = (uSmear + uKick * 0.32) * mask * streakLength;
    float lod = imageLod(uCell);
    float blurLod = lod + clamp(smear * 30.0, 0.0, 2.5);
    float total = 0.0;
    for (int index = 0; index < taps; index++) {
      float offset = float(index) / float(taps - 1) - 0.5;
      vec2 tap = point + along * offset * smear;
      total += imageLuma(coverUv(vec2(tap.x / aspect, tap.y) + 0.5), blurLod);
    }
    float luma = total / float(taps);
    float blurred = imageLuma(coverUv(vec2(point.x / aspect, point.y) + 0.5), blurLod + 2.3);
    luma += (hash(vec2(streak, 9.1)) - 0.5) * 0.14 * mask * min(smear * 12.0, 1.0);
    float tone = crispTone(curveTone(luma, mix(blurred, luma, min(smear * 8.0, 1.0)), printContrast, 1.0));

    float row = floor(dot(point, across) * uResolution.y / uCell);
    float isMiddleRow = step(abs(row - streak * 3.0 - 1.0), 0.5);
    float lineSeed = hash(vec2(streak, 5.3));
    float lineLength = (0.3 + 0.8 * hash(vec2(streak, 7.9))) * smoothstep(0.1, 0.9, uKick);
    float fray = 1.0 - bayer8(pixel / uCell) * 0.45;
    float speedLine = step(0.84, lineSeed) * isMiddleRow * step(abs(reachAlong) / max(lineLength, 0.001), fray) * step(0.3, mask);
    tone = mix(tone, 1.0 - step(0.5, tone), speedLine);

    float ink = 1.0 - tone;
    float printed = step(bayer8(pixel / uCell), ink);
    gl_FragColor = vec4(mix(uPaper, uInk, mix(ink, printed, uDither)), 1.0);
    #include <colorspace_fragment>
  }
`;

const createUniforms = (): SpeedSmearUniforms => ({
  ...createImageCoverUniforms(),
  uAngle: { value: 0 },
  uCell: { value: speedSmearDefaults.cell },
  uDither: { value: 1 },
  uInk: { value: new Color(speedSmearDefaults.ink) },
  uKick: { value: 0 },
  uLight: { value: new Vector2(0, 0) },
  uPaper: { value: new Color(speedSmearDefaults.paper) },
  uReach: { value: speedSmearDefaults.reach },
  uSmear: { value: speedSmearDefaults.smear },
});

export class SpeedSmearMaterial extends ShaderMaterial {
  declare uniforms: SpeedSmearUniforms;

  constructor() {
    super({
      depthTest: false,
      depthWrite: false,
      fragmentShader,
      toneMapped: false,
      uniforms: createUniforms(),
      vertexShader: fullscreenVertexShader,
    });
  }
}
