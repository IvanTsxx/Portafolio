import { writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { encodeInkPng } from "@/components/lab/source/poster-png";
import { sourceImages } from "@/components/lab/source/tone-chunk";
import type { SourceImage } from "@/components/lab/source/tone-chunk";

export const posterGrid = { columns: 240, rows: 150 } as const;

const publicFolder = path.join(import.meta.dir, "../../../public");

export const readSourceLuma = async (image: SourceImage) => {
  const { columns, rows } = posterGrid;
  const { focus, path: imagePath } = sourceImages[image];
  const source = sharp(path.join(publicFolder, imagePath));
  const { width = columns, height = rows } = await source.metadata();
  const scale = Math.max(columns / width, rows / height);
  const coverWidth = Math.round(width * scale);
  const coverHeight = Math.round(height * scale);
  const left = Math.round(
    Math.min(
      Math.max(focus.x * coverWidth - columns / 2, 0),
      coverWidth - columns
    )
  );
  const top = Math.round(
    Math.min(Math.max(focus.y * coverHeight - rows / 2, 0), coverHeight - rows)
  );
  const rgb = await source
    .resize(coverWidth, coverHeight, { kernel: "lanczos3" })
    .extract({ height: rows, left, top, width: columns })
    .removeAlpha()
    .raw()
    .toBuffer();
  const luma = new Float32Array(columns * rows);
  for (let index = 0; index < luma.length; index += 1) {
    luma[index] =
      (0.2126 * (rgb[index * 3] ?? 0) +
        0.7152 * (rgb[index * 3 + 1] ?? 0) +
        0.0722 * (rgb[index * 3 + 2] ?? 0)) /
      255;
  }
  return luma;
};

export const writePosterBitmap = async (folder: string, ink: Uint8Array) => {
  const { columns, rows } = posterGrid;
  const png = encodeInkPng(ink, columns, rows);
  await writeFile(
    path.join(folder, "poster-bitmap.ts"),
    `export const posterBitmap = {\n  columns: ${columns},\n  png: "${png.toString("base64")}",\n  rows: ${rows},\n} as const;\n`
  );
  console.log(`poster ${columns}x${rows}, ${png.length} bytes png`);
};
