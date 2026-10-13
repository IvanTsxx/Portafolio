import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter } from "three";

export const glyphAspect = 0.6;

const tileHeight = 96;
const tileWidth = Math.round(tileHeight * glyphAspect);

export interface GlyphAtlas {
  texture: CanvasTexture;
  count: number;
}

const monoFamily = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-mono")
    .trim() || "monospace";

const drawGlyph = (
  context: CanvasRenderingContext2D,
  glyph: string,
  slot: number
) => {
  context.fillText(glyph, (slot + 0.5) * tileWidth, tileHeight * 0.52);
};

const prepare = (context: CanvasRenderingContext2D, font: string) => {
  context.fillStyle = "#000";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.fillStyle = "#fff";
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
};

const measureCoverage = (font: string, glyphs: readonly string[]) => {
  const canvas = document.createElement("canvas");
  canvas.width = tileWidth;
  canvas.height = tileHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return glyphs.map(() => 0);
  }
  return glyphs.map((glyph) => {
    prepare(context, font);
    drawGlyph(context, glyph, 0);
    const { data } = context.getImageData(0, 0, tileWidth, tileHeight);
    let total = 0;
    for (let index = 0; index < data.length; index += 4) {
      total += data[index] ?? 0;
    }
    return total;
  });
};

export const buildGlyphAtlas = async (ramp: string): Promise<GlyphAtlas> => {
  const font = `500 ${tileHeight}px ${monoFamily()}`;
  await document.fonts.load(font, ramp);
  const unique = [...new Set([" ", ...ramp])];
  const coverage = measureCoverage(font, unique);
  const ordered = unique
    .map((glyph, index) => ({ coverage: coverage[index] ?? 0, glyph }))
    .toSorted((first, second) => first.coverage - second.coverage);

  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * ordered.length;
  canvas.height = tileHeight;
  const context = canvas.getContext("2d");
  if (context) {
    prepare(context, font);
    for (const [slot, { glyph }] of ordered.entries()) {
      drawGlyph(context, glyph, slot);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  return { count: ordered.length, texture };
};
