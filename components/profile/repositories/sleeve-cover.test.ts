import { describe, expect, test } from "bun:test";

import { sleeveCoverOf } from "./sleeve-cover";

const names = [
  "IvanTsxx/Portafolio",
  "IvanTsxx/better-auth-mp",
  "IvanTsxx/cache-components-granular",
  "IvanTsxx/AI-Nextjs-Monorepo-Starter",
  "IvanTsxx/skills-packs",
  "IvanTsxx/mcp-tiendanube",
];

const MAX_COVER_BYTES = 8192;

describe("sleeve covers", () => {
  test("draws the same cover for the same repository", () => {
    expect(sleeveCoverOf("IvanTsxx/notes", "TypeScript")).toBe(
      sleeveCoverOf("IvanTsxx/notes", "TypeScript")
    );
  });

  test("gives every pinned repository its own cover", () => {
    const covers = new Set(
      names.flatMap((name) => [
        sleeveCoverOf(name, "TypeScript"),
        sleeveCoverOf(name, "Python"),
      ])
    );
    expect(covers.size).toBe(names.length * 2);
  });

  test("keeps every cover under 8 KB and never blank", () => {
    for (const name of names) {
      for (const language of ["TypeScript", "Python", "Go", "Elixir"]) {
        const cover = sleeveCoverOf(name, language);
        expect(cover.length).toBeGreaterThan(0);
        expect(new TextEncoder().encode(cover).length).toBeLessThan(
          MAX_COVER_BYTES
        );
      }
    }
  });
});
