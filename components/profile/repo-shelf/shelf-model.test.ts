import { describe, expect, test } from "bun:test";

import type { PinnedRepository } from "@/lib/github/model";

import { buildShelf, spineLines, toneOfLanguage } from "./shelf-model";

const repository = (
  name: string,
  language: string | null
): PinnedRepository => ({
  createdAt: "2026-01-30",
  description: null,
  language,
  name,
  nameWithOwner: `IvanTsxx/${name}`,
  stars: 2,
  visibility: "public",
});

describe("repo shelf", () => {
  test("keeps the pinned order and links each book to GitHub", () => {
    const books = buildShelf([
      repository("Portafolio", "TypeScript"),
      repository("skills-packs", "Python"),
    ]);
    expect(books.map((book) => book.name)).toEqual([
      "Portafolio",
      "skills-packs",
    ]);
    expect(books[1]?.url).toBe("https://github.com/IvanTsxx/skills-packs");
  });

  test("tones a spine by language and falls back to deep paper", () => {
    expect(toneOfLanguage("TypeScript")).toBe("paper");
    expect(toneOfLanguage("Python")).toBe("steel");
    expect(toneOfLanguage("Rust")).toBe("deep");
    expect(toneOfLanguage(null)).toBe("deep");
  });

  test("keeps short names on one spine line", () => {
    expect(spineLines("skills-packs")).toEqual(["skills-packs"]);
  });

  test("breaks long names at the hyphen nearest the middle", () => {
    expect(spineLines("AI-Nextjs-Monorepo-Starter")).toEqual([
      "AI-Nextjs-",
      "Monorepo-Starter",
    ]);
    expect(spineLines("cache-components-granular")).toEqual([
      "cache-components-",
      "granular",
    ]);
  });
});
