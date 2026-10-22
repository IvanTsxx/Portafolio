import { writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { extractPalette } from "@/components/lab/source/palette";
import { ditherPrint } from "@/components/lab/source/print-tone";
import {
  posterGrid,
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { paletteSample, vegetaImage } from "./settings";

const folder = import.meta.dir;
const imagePath = path.join(folder, "../../../../public", vegetaImage.path);

const luma = await readSourceLuma("vegeta");
await writePosterBitmap(
  folder,
  ditherPrint(luma, posterGrid.columns, posterGrid.rows)
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
  path.join(folder, "explosion-palette.ts"),
  `import type { Rgb } from "@/components/lab/source/palette";\n\nexport const explosionPalette: readonly Rgb[] = [\n${paletteRows}\n];\n`
);

console.log(`explosion palette ${palette.length} inks`);
