import { Color, ShaderMaterial, Vector2, Vector3 } from "three";
import type { IUniform, Texture } from "three";

import { blueNoiseSize } from "@/registry/ivan/lib/blue-noise";
import {
  createImageCoverUniforms,
  fullscreenVertexShader,
  imageCoverChunk,
} from "@/registry/ivan/lib/image-cover";
import type { ImageCoverUniforms } from "@/registry/ivan/lib/image-cover";
import {
  nearestInkChunk,
  orderedChunk,
  orderedDitherIndex,
} from "@/registry/ivan/lib/ordered-print";
import { paletteSize } from "@/registry/ivan/lib/palette";
import {
  bayerChunk,
  hashChunk,
  valueNoiseChunk,
} from "@/registry/ivan/lib/print-noise";
import {
  printSeparation,
  toneChunk,
  toneCurve,
  toneSeparationChunk,
} from "@/registry/ivan/lib/tone-curve";

export const blastPrintDefaults = {
  auraRadius: 1,
  blasts: 0,
  cell: 3,
  dither: "blue-noise",
  ink: "#0B0B0C",
  paper: "#EDECE8",
  paused: false,
  threshold: 0,
} as const;

export interface BlastPrintUniforms extends ImageCoverUniforms {
  uAura: IUniform<Vector2>;
  uAuraRadius: IUniform<number>;
  uAuraStrength: IUniform<number>;
  uBlast: IUniform<Vector2>;
  uBlueNoise: IUniform<Texture | null>;
  uCell: IUniform<number>;
  uColor: IUniform<number>;
  uDither: IUniform<number>;
  uFront: IUniform<number>;
  uInk: IUniform<Color>;
  uNoiseSize: IUniform<number>;
  uPaper: IUniform<Color>;
  uPalette: IUniform<Vector3[]>;
  uReprint: IUniform<number>;
  uRing: IUniform<number>;
  uThreshold: IUniform<number>;
  uTime: IUniform<number>;
}

const glslFloat = (value: number) => value.toFixed(4);

const fragmentShader = `
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uCell;
  uniform float uThreshold;
  uniform float uTime;
  uniform vec2 uAura;
  uniform float uAuraRadius;
  uniform float uAuraStrength;
  uniform vec2 uBlast;
  uniform float uRing;
  uniform float uFront;
  uniform float uReprint;
  uniform float uColor;

  const float printContrast = ${glslFloat(toneCurve.contrast)};
  const float colorSpread = 0.3;
  const float tileCells = 6.0;

  ${imageCoverChunk}
  ${hashChunk}
  ${valueNoiseChunk}
  ${bayerChunk}
  ${orderedChunk}
  ${toneChunk}
  ${nearestInkChunk(paletteSize)}

  ${toneSeparationChunk("crispTone", printSeparation)}

  void main() {
    if (uHasImage < 0.5) {
      discard;
    }
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 cell = floor(pixel / uCell);
    vec2 center = (cell + 0.5) * uCell;
    vec2 stage = center / uResolution.y;

    vec2 uv = coverUv(center / uResolution);
    float lod = imageLod(uCell);

    vec3 color = textureLod(uImage, uv, lod).rgb;
    vec3 blurredColor = textureLod(uImage, uv, lod + 2.3).rgb;
    float luma = dot(color, lumaWeights);
    float blurred = dot(blurredColor, lumaWeights);
    float tone = crispTone(curveTone(luma, blurred, printContrast, 1.0));
    vec3 print = curveColor(color, blurredColor, printContrast, 1.0);

    vec2 fromAura = stage - uAura / uResolution.y;
    float above = step(0.0, fromAura.y);
    vec2 shaped = vec2(fromAura.x * 1.2, fromAura.y * mix(1.0, 0.45, above)) / max(uAuraRadius, 0.001);
    float heat = exp(-dot(shaped, shaped) * 1.25) * uAuraStrength;
    float tongue = valueNoise(vec2(cell.x * 0.14, cell.y * 0.032 - uTime * 3.4));
    float flicker = valueNoise(vec2(cell.x * 0.33, cell.y * 0.09 - uTime * 6.5));
    float field = tongue * 0.78 + flicker * 0.22;
    float flame = step(1.0 - heat * 0.95, field) * step(0.001, uAuraStrength);
    float core = step(1.0 - heat * 0.5, field);
    float rim = flame * step(field, 1.0 - heat * 0.95 + 0.04);
    float isNegative = flame * (1.0 - core);
    tone = mix(tone, 1.0 - tone, isNegative);
    print = mix(print, 1.0 - print, isNegative);

    float level = orderedLevel(cell);
    float isInk = max(step(tone - uThreshold - level, -0.0001), rim);

    vec3 printed = mix(uPaper, uInk, isInk);

    float aspect = uResolution.x / uResolution.y;
    float diagonal = length(vec2(aspect, 1.0));
    vec2 blast = uBlast / uResolution.y;
    float blastDistance = length(stage - blast);
    float ragged = (valueNoise(cell * 0.2) - 0.5) * 0.07;
    float swept = step(blastDistance + ragged, uRing);
    vec2 tile = floor(cell / tileCells);
    vec2 tileStage = (tile + 0.5) * tileCells * uCell / uResolution.y;
    float order = clamp(length(tileStage - blast) / diagonal * 0.82 + hash(tile + 17.0) * 0.18, 0.0, 1.0);
    float reprinted = step(order, uReprint) * step(0.001, uReprint);
    vec3 colorPrint = toLinear(nearestInk(print - uThreshold + (level - 0.5) * colorSpread));
    float isColor = swept * reprinted * step(order, uColor) * step(0.001, uColor);
    printed = mix(printed, colorPrint, isColor);

    float frontOffset = (blastDistance + ragged - uRing) / 0.04;
    float front = exp(-frontOffset * frontOffset) * uFront;
    float isFront = step(level, front) * step(0.001, front);
    printed = mix(printed, uPaper, swept * (1.0 - reprinted));
    printed = mix(printed, uInk, isFront);

    gl_FragColor = vec4(printed, 1.0);
    #include <colorspace_fragment>
  }
`;

const createUniforms = (): BlastPrintUniforms => ({
  ...createImageCoverUniforms(),
  uAura: { value: new Vector2(0, 0) },
  uAuraRadius: { value: 0.24 },
  uAuraStrength: { value: 0 },
  uBlast: { value: new Vector2(0, 0) },
  uBlueNoise: { value: null },
  uCell: { value: blastPrintDefaults.cell },
  uColor: { value: 0 },
  uDither: { value: orderedDitherIndex(blastPrintDefaults.dither) },
  uFront: { value: 0 },
  uInk: { value: new Color(blastPrintDefaults.ink) },
  uNoiseSize: { value: blueNoiseSize },
  uPalette: {
    value: Array.from({ length: paletteSize }, () => new Vector3()),
  },
  uPaper: { value: new Color(blastPrintDefaults.paper) },
  uReprint: { value: 1 },
  uRing: { value: 0 },
  uThreshold: { value: blastPrintDefaults.threshold },
  uTime: { value: 0 },
});

export class BlastPrintMaterial extends ShaderMaterial {
  declare uniforms: BlastPrintUniforms;

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
