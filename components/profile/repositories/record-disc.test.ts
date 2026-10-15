import { describe, expect, test } from "bun:test";

import { discGrooves, discSheenOf } from "./record-disc";

const names = [
  "IvanTsxx/Portafolio",
  "IvanTsxx/better-auth-mp",
  "IvanTsxx/cache-components-granular",
  "IvanTsxx/AI-Nextjs-Monorepo-Starter",
  "IvanTsxx/skills-packs",
  "IvanTsxx/mcp-tiendanube",
];

const MAX_DISC_BYTES = 8192;

const bytesOf = (text: string) => new TextEncoder().encode(text).length;

describe("record discs", () => {
  test("presses the same disc for the same repository", () => {
    expect(discSheenOf("IvanTsxx/notes")).toBe(discSheenOf("IvanTsxx/notes"));
  });

  test("gives every pinned repository its own sheen", () => {
    expect(new Set(names.map(discSheenOf)).size).toBe(names.length);
  });

  test("keeps every disc with its grooves under 8 KB and never blank", () => {
    for (const name of names) {
      const sheen = discSheenOf(name);
      expect(sheen.length).toBeGreaterThan(0);
      expect(bytesOf(sheen) + bytesOf(discGrooves)).toBeLessThan(
        MAX_DISC_BYTES
      );
    }
  });
});
