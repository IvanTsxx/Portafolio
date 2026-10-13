import {
  DataTexture,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
} from "three";

export const glyphDots = { columns: 6, rows: 8 } as const;

export const glyphSetNames = ["binary", "hex", "kana"] as const;

export type GlyphSetName = (typeof glyphSetNames)[number];

const glyphSets = {
  binary: [..."01"],
  hex: [..."0123456789ABCDEF"],
  kana: [..."ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"],
} as const satisfies Record<GlyphSetName, readonly string[]>;

const allGlyphs = glyphSetNames.flatMap((name) => glyphSets[name]);

export const glyphRangeOf = (name: GlyphSetName) => ({
  count: glyphSets[name].length,
  start: glyphSetNames
    .slice(0, glyphSetNames.indexOf(name))
    .reduce((total, previous) => total + glyphSets[previous].length, 0),
});

export const atlasColumns = 16;
const atlasRows = Math.ceil(allGlyphs.length / atlasColumns);
const supersample = 10;

export const atlasTexels = {
  height: atlasRows * glyphDots.rows,
  width: atlasColumns * glyphDots.columns,
} as const;

const monoFamily = () =>
  getComputedStyle(document.body)
    .getPropertyValue("--font-geist-mono")
    .trim() || "ui-monospace, monospace";

export const buildGlyphAtlas = () => {
  const tileWidth = glyphDots.columns * supersample;
  const tileHeight = glyphDots.rows * supersample;
  const canvas = document.createElement("canvas");
  canvas.width = atlasColumns * tileWidth;
  canvas.height = atlasRows * tileHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const texels = new Uint8Array(atlasTexels.width * atlasTexels.height * 4);
  if (!context) {
    return new DataTexture(texels, atlasTexels.width, atlasTexels.height);
  }
  context.fillStyle = "#fff";
  context.font = `600 ${Math.round(tileHeight * 0.9)}px ${monoFamily()}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const [index, glyph] of allGlyphs.entries()) {
    const column = index % atlasColumns;
    const row = Math.floor(index / atlasColumns);
    context.fillText(
      glyph,
      (column + 0.5) * tileWidth - supersample * 0.5,
      (row + 0.5) * tileHeight - supersample * 0.4,
      tileWidth - supersample
    );
  }
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const area = supersample * supersample;
  for (let texelY = 0; texelY < atlasTexels.height; texelY += 1) {
    for (let texelX = 0; texelX < atlasTexels.width; texelX += 1) {
      let sum = 0;
      for (let y = 0; y < supersample; y += 1) {
        const rowStart =
          ((texelY * supersample + y) * canvas.width + texelX * supersample) *
          4;
        for (let x = 0; x < supersample; x += 1) {
          sum += data[rowStart + x * 4 + 3] ?? 0;
        }
      }
      const texel = (texelY * atlasTexels.width + texelX) * 4;
      const coverage = Math.round(sum / area);
      texels[texel] = coverage;
      texels[texel + 1] = coverage;
      texels[texel + 2] = coverage;
      texels[texel + 3] = 255;
    }
  }
  const texture = new DataTexture(
    texels,
    atlasTexels.width,
    atlasTexels.height,
    RGBAFormat,
    UnsignedByteType
  );
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
};
