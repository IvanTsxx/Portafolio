import { writeFile } from "node:fs/promises";
import path from "node:path";

import { renderIconMark, tabIconSizes } from "./icon-mark";

const headerBytes = 6;
const entryBytes = 16;
const bitsPerPixel = 32;

interface IcoImage {
  bytes: Buffer;
  size: number;
}

const encodeIco = (images: readonly IcoImage[]) => {
  const header = Buffer.alloc(headerBytes);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = headerBytes + entryBytes * images.length;
  const entries = images.map(({ bytes, size }) => {
    const entry = Buffer.alloc(entryBytes);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(bitsPerPixel, 6);
    entry.writeUInt32LE(bytes.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += bytes.length;
    return entry;
  });
  return Buffer.concat([
    header,
    ...entries,
    ...images.map(({ bytes }) => bytes),
  ]);
};

const images = await Promise.all(
  tabIconSizes.map(async (size) => ({
    bytes: Buffer.from(await renderIconMark("tab", size).arrayBuffer()),
    size,
  }))
);

const target = path.join(process.cwd(), "app", "favicon.ico");

await writeFile(target, encodeIco(images));

process.stdout.write(`Wrote app/favicon.ico (${tabIconSizes.join(", ")} px)\n`);
