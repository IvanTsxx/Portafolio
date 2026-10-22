import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { SourceImage } from "@/components/lab/source/tone-chunk";
import { readSourceLuma } from "@/components/lab/source/write-poster-bitmap";

const grid = { columns: 128, rows: 72 } as const;

const posterImages: readonly SourceImage[] = ["messi"];

const lines = await Promise.all(
  posterImages.map(async (value) => {
    const luma = await readSourceLuma(value, grid);
    const levels = Uint8Array.from(luma, (tone) => Math.round(tone * 255));
    return `  ${value}: "${Buffer.from(levels).toString("base64")}",`;
  })
);

await writeFile(
  path.join(import.meta.dir, "poster-tones.ts"),
  `export const posterToneGrid = { columns: ${grid.columns}, rows: ${grid.rows} } as const;\n\nexport const posterTones = {\n${lines.join("\n")}\n} as const;\n`
);
console.log(
  `poster tones ${grid.columns}x${grid.rows} for ${lines.length} images`
);
