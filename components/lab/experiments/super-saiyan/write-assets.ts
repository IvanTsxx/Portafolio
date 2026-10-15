import { writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { blueNoiseBytes } from "./blue-noise";
import { extractPalette, paletteSample } from "./palette";
import {
  ditherPoster,
  encodeInkPng,
  encodeLevelPng,
  posterGrid,
} from "./poster-raster";

const folder = import.meta.dir;
const publicFolder = path.join(folder, "../../../../public/experiments");
const imagePath = path.join(publicFolder, "super-saiyan.jpg");
const noiseSide = 64;

const { columns, rows } = posterGrid;
const rgb = await sharp(imagePath)
  .resize(columns, rows, { fit: "cover", kernel: "lanczos3" })
  .removeAlpha()
  .raw()
  .toBuffer();

const ink = ditherPoster(new Uint8Array(rgb), columns, rows);
const png = encodeInkPng(ink, columns, rows);

await writeFile(
  path.join(folder, "poster-bitmap.ts"),
  `export const posterBitmap = {\n  columns: ${columns},\n  png: "${png.toString("base64")}",\n  rows: ${rows},\n} as const;\n`
);

const sampleRgb = await sharp(imagePath)
  .resize(paletteSample.columns, paletteSample.rows, { fit: "fill" })
  .removeAlpha()
  .raw()
  .toBuffer();
const palette = extractPalette(new Uint8Array(sampleRgb));
const paletteRows = palette
  .map(([red, green, blue]) => `  [${red}, ${green}, ${blue}],`)
  .join("\n");
await writeFile(
  path.join(folder, "retro-palette.ts"),
  `import type { Rgb } from "./palette";\n\nexport const retroPalette: readonly Rgb[] = [\n${paletteRows}\n];\n`
);

const noisePng = encodeLevelPng(blueNoiseBytes(noiseSide), noiseSide);
await writeFile(path.join(publicFolder, "blue-noise-64.png"), noisePng);

console.log(
  `blue noise ${noiseSide}x${noiseSide}, ${noisePng.length} bytes png`
);
console.log(`retro palette ${palette.length} inks`);
console.log(`poster ${columns}x${rows}, ${png.length} bytes png`);
