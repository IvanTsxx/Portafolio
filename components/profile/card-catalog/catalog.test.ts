import { describe, expect, test } from "bun:test";

import type { PinnedRepository } from "@/lib/github/model";

import {
  catalogOf,
  catalogTitle,
  descriptionRules,
  languageText,
  MOST_NOTCHES,
} from "./catalog";

const repository = (
  name: string,
  language: string | null,
  stars: number,
  description: string | null = null
): PinnedRepository => ({
  createdAt: "2026-01-30",
  description,
  language,
  name,
  nameWithOwner: `IvanTsxx/${name}`,
  stars,
  visibility: "public",
});

describe("card catalog", () => {
  test("gives each language one tab position, the most common first", () => {
    const catalog = catalogOf([
      repository("a", "Python", 1),
      repository("b", "TypeScript", 2),
      repository("c", "TypeScript", 3),
      repository("d", null, 0),
    ]);
    expect(catalog.languages).toEqual([
      { count: 2, language: "TypeScript" },
      { count: 1, language: "Python" },
      { count: 1, language: "Unknown" },
    ]);
    expect(catalog.cards.map((card) => card.tab)).toEqual([1, 0, 0, 2]);
    expect(languageText(catalog)).toBe("TypeScript 2 · Python 1 · Unknown 1");
  });

  test("counts every star and sizes the notch row to the most starred card", () => {
    const catalog = catalogOf([
      repository("a", "Go", 7),
      repository("b", "Go", 1),
    ]);
    expect(catalog.stars).toBe(8);
    expect(catalog.notches).toBe(7);
    expect(catalogTitle(catalog)).toBe("2 cards · 8 stars");
  });

  test("keeps at least five notches and never more than the card edge holds", () => {
    expect(catalogOf([repository("a", "Go", 1)]).notches).toBe(5);
    expect(catalogOf([repository("a", "Go", 40)]).notches).toBe(MOST_NOTCHES);
  });

  test("rules one typed line per stretch of description, three at most", () => {
    expect(descriptionRules(null)).toEqual([]);
    expect(descriptionRules("x".repeat(28))).toEqual([0.5]);
    expect(descriptionRules("x".repeat(400))).toEqual([1, 1, 1]);
  });

  test("links every card to its repository and marks templates", () => {
    const [card] = catalogOf([
      { ...repository("starter", "TypeScript", 4), visibility: "public-template" },
    ]).cards;
    expect(card?.url).toBe("https://github.com/IvanTsxx/starter");
    expect(card?.isTemplate).toBe(true);
  });
});
