import { shaderMaterial } from "@react-three/drei";
import { Vector2 } from "three";
import type { Texture } from "three";

import {
  createSourceUniforms,
  sourceToneChunk,
} from "@/components/lab/source/tone-chunk";

import { glyphAspect } from "./glyph-atlas";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uAtlas;
  uniform float uGlyphCount;
  uniform float uCell;
  uniform float uPixelRatio;
  uniform float uScanMode;
  uniform vec2 uScan;
  uniform vec2 uScanExtent;

  ${sourceToneChunk}

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 grid = vec2(pixel.x, uResolution.y - pixel.y);
    vec2 coarseSize = vec2(uCell * ${glyphAspect.toFixed(2)}, uCell);
    vec2 coarseCell = floor(grid / coarseSize);
    vec2 scanCell = floor(uScan / coarseSize);
    vec2 away = abs(coarseCell - scanCell);
    bool inScan = away.x <= uScanExtent.x && away.y <= uScanExtent.y;
    bool isSharp = inScan && uScanMode < 0.5;
    bool isInverted = inScan && uScanMode > 0.5;

    vec2 size = isSharp ? coarseSize * 0.5 : coarseSize;
    vec2 cell = floor(grid / size);
    vec2 local = grid / size - cell;
    vec2 cellCenter = (cell + 0.5) * size;
    vec2 point = vec2(cellCenter.x - uResolution.x * 0.5, uResolution.y * 0.5 - cellCenter.y) / uResolution.y;
    float tone = sourceInk(point, sourceLod(size.y, uResolution));
    if (isInverted) {
      tone = 1.0 - tone;
    }
    float glyph = min(floor(tone * uGlyphCount), uGlyphCount - 1.0);
    vec2 atlasUv = vec2((glyph + local.x) / uGlyphCount, 1.0 - local.y);
    vec2 stepX = vec2(1.0 / (size.x * uGlyphCount), 0.0);
    vec2 stepY = vec2(0.0, 1.0 / size.y);
    float mark = textureGrad(uAtlas, atlasUv, stepX, stepY).r;
    if (isInverted) {
      mark = 1.0 - mark;
    }

    vec2 low = (scanCell - uScanExtent) * coarseSize;
    vec2 high = (scanCell + uScanExtent + 1.0) * coarseSize;
    vec2 outside = max(low - grid, grid - high);
    float frameReach = max(outside.x, outside.y);
    float frame = step(0.0, frameReach) * step(frameReach, uPixelRatio);

    gl_FragColor = vec4(mix(uPaper, uInk, max(mark, frame)), 1.0);
    #include <colorspace_fragment>
  }
`;

interface AtlasUniform {
  uAtlas: Texture | null;
}

const atlasUniform: AtlasUniform = { uAtlas: null };

export const AsciiMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    ...atlasUniform,
    uCell: 12,
    uGlyphCount: 1,
    uPixelRatio: 1,
    uScan: new Vector2(0, 0),
    uScanExtent: new Vector2(6, 3),
    uScanMode: 0,
  },
  vertexShader,
  fragmentShader
);
