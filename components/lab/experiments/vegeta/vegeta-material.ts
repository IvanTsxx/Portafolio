import { shaderMaterial } from "@react-three/drei";
import { Vector2 } from "three";
import type { Texture } from "three";

import {
  inkRgb,
  nearestInkChunk,
  orderedPrintChunk,
  paperRgb,
  rgbVector,
} from "@/components/lab/source/ordered-print";
import { toneChunk, toneCurve } from "@/components/lab/source/print-tone";
import { revealChunk } from "@/components/lab/source/stage-reveal";

import { explosionPalette } from "./explosion-palette";
import { ringReach } from "./final-explosion";
import { majinMark, vegetaImage } from "./settings";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const glslFloat = (value: number) => value.toFixed(4);

const paletteSize = explosionPalette.length;

const fragmentShader = `
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform sampler2D uImage;
  uniform vec2 uImageSize;
  uniform float uHasImage;
  uniform float uCell;
  uniform float uThreshold;
  uniform float uTime;
  uniform float uPulse;
  uniform vec2 uAura;
  uniform float uAuraRadius;
  uniform float uAuraStrength;
  uniform vec2 uBlast;
  uniform float uRing;
  uniform float uFront;
  uniform float uReprint;
  uniform float uColor;

  const vec2 focus = vec2(${glslFloat(vegetaImage.focus.x)}, ${glslFloat(1 - vegetaImage.focus.y)});
  const vec2 majinCenter = vec2(${glslFloat(majinMark.center.x)}, ${glslFloat(1 - majinMark.center.y)});
  const vec2 majinRadius = vec2(${glslFloat(majinMark.radius.x)}, ${glslFloat(majinMark.radius.y)});
  const float printContrast = ${glslFloat(toneCurve.contrast)};
  const float ringReach = ${glslFloat(ringReach)};
  const float colorSpread = 0.3;

  ${toneChunk}

  ${orderedPrintChunk}

  ${nearestInkChunk(paletteSize)}

  ${revealChunk}

  void main() {
    revealBefore();
    if (uHasImage < 0.5) {
      discard;
    }
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 cell = floor(pixel / uCell);
    vec2 center = (cell + 0.5) * uCell;
    vec2 stage = center / uResolution.y;

    vec2 span = imageSpan(uResolution, uImageSize);
    vec2 start = clamp(focus - span * 0.5, vec2(0.0), vec2(1.0) - span);
    vec2 uv = start + center / uResolution * span;
    float texelsPerCell = uCell * span.y * uImageSize.y / uResolution.y;
    float lod = log2(max(texelsPerCell, 1.0));

    vec3 color = textureLod(uImage, uv, lod).rgb;
    vec3 blurredColor = textureLod(uImage, uv, lod + 2.3).rgb;
    float luma = dot(color, lumaWeights);
    float blurred = dot(blurredColor, lumaWeights);
    float tone = curveTone(luma, blurred, printContrast, 1.0);
    vec3 print = curveColor(color, blurredColor, printContrast, 1.0);

    float majinReach = length((uv - majinCenter) / majinRadius);
    float majin = 1.0 - smoothstep(0.55, 1.0, majinReach);
    float spread = dot(textureLod(uImage, uv, lod + 1.4).rgb, lumaWeights);
    float stroke = smoothstep(0.8, 0.5, spread) * majin;
    float thicken = stroke * (0.2 + 0.6 * uPulse) + majin * uPulse * 0.06;
    tone -= thicken;
    print -= thicken;

    vec2 auraAway = stage - uAura / uResolution.y;
    float auraDistance = length(auraAway);
    float flame = valueNoise(vec2(cell.x * 0.16, cell.y * 0.1 - uTime * 2.4));
    float flicker = valueNoise(cell * 0.45 + uTime * 3.0);
    float auraEdge = uAuraRadius * uAuraStrength * (0.78 + 0.34 * flame + 0.08 * flicker);
    float auraOffset = (auraDistance - auraEdge) / 0.045;
    float inside = 1.0 - smoothstep(-1.0, 1.0, auraOffset);
    float isNegative = step(bayer8(cell + vec2(5.0, 2.0)), inside) * step(0.001, uAuraStrength);
    float rim = exp(-auraOffset * auraOffset * 0.6) * step(0.001, uAuraStrength);
    tone = mix(tone, 1.0 - tone, isNegative) - rim * 0.45;
    print = mix(print, 1.0 - print, isNegative) - rim * 0.45;

    float level = orderedLevel(cell);
    float isInk = step(tone - uThreshold - level, -0.0001);

    vec2 local = (pixel - center) / uCell;
    float markScale = mix(1.15, 0.9, smoothstep(4.0, 12.0, uCell));
    float corner = 0.2;
    vec2 markReach = max(abs(local) - (0.5 * markScale - corner), 0.0);
    float soft = 0.75 / uCell;
    float mark = 1.0 - smoothstep(-soft, soft, length(markReach) - corner);

    vec3 printed = mix(uPaper, uInk, isInk * mark);

    float blastDistance = length(stage - uBlast / uResolution.y);
    float ragged = (valueNoise(cell * 0.2) - 0.5) * 0.09;
    float swept = step(blastDistance + ragged, uRing);
    float order = hash(cell + 17.0) * 0.65 + clamp(blastDistance / ringReach, 0.0, 1.0) * 0.35;
    float reprinted = step(order, uReprint);
    vec3 colorPrint = nearestInk(print - uThreshold + (level - 0.5) * colorSpread);
    float isColor = swept * reprinted * step(bayer8(cell + vec2(3.0, 5.0)), uColor);
    printed = mix(printed, colorPrint, isColor);

    float frontOffset = (blastDistance + ragged - uRing) / 0.05;
    float front = exp(-frontOffset * frontOffset) * uFront;
    float isFront = step(level, front) * step(0.001, front);
    printed = mix(printed, uPaper, swept * (1.0 - reprinted));
    printed = mix(printed, uInk, isFront);

    gl_FragColor = vec4(toLinear(printed), 1.0);
    #include <colorspace_fragment>
  }
`;

const noTexture = (): Texture | null => null;

const uniforms = {
  uAura: new Vector2(0, 0),
  uAuraRadius: 0.24,
  uAuraStrength: 0,
  uBlast: new Vector2(0, 0),
  uBlueNoise: noTexture(),
  uCell: 3,
  uColor: 0,
  uDither: 3,
  uFront: 0,
  uHasImage: 0,
  uImage: noTexture(),
  uImageSize: new Vector2(vegetaImage.width, vegetaImage.height),
  uInk: rgbVector(inkRgb),
  uNoiseSize: 64,
  uOrigin: new Vector2(0, 0),
  uOriginal: 0,
  uPalette: explosionPalette.map(rgbVector),
  uPaper: rgbVector(paperRgb),
  uPulse: 0.5,
  uReprint: 1,
  uResolution: new Vector2(1, 1),
  uRing: 0,
  uThreshold: 0,
  uTime: 0,
};

export const VegetaMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader
);
