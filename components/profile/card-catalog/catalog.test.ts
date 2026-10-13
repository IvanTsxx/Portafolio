import { describe, expect, test } from "bun:test";

import type { PinnedRepository } from "@/lib/github/model";

import {
  cardLine,
  catalogOf,
  catalogTitle,
  descriptionRules,
  languageText,
  MOST_NOTCHES,
  repositoryFile,
  tourStepOf,
} from "./catalog";

const repository = (
  name: string,
  language: string | null,
  stars: number,
  description: string | null = null
): PinnedRepository => ({
  createdAt: "2026-01-30",
  description,
  forks: 0,
  homepage: null,
  language,
  name,
  nameWithOwner: `IvanTsxx/${name}`,
  pushedAt: "2026-04-09",
  stars,
  topics: [],
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
      {
        ...repository("starter", "TypeScript", 4),
        visibility: "public-template",
      },
    ]).cards;
    expect(card?.url).toBe("https://github.com/IvanTsxx/starter");
    expect(card?.isTemplate).toBe(true);
  });
});

describe("card catalog readout and file", () => {
  test("reads the description under attention, the detail when there is none", () => {
    const [described, bare] = catalogOf([
      repository("auth", "Python", 5, "Mercado Pago plugin for Better Auth."),
      repository("mcp", "TypeScript", 1),
    ]).cards;
    expect(described && cardLine(described)).toBe(
      "Mercado Pago plugin for Better Auth."
    );
    expect(bare && cardLine(bare)).toBe("TypeScript · 1 star");
  });

  test("tours every card in order and reads every third stop", () => {
    const stops = Array.from({ length: 7 }, (_, step) =>
      tourStepOf(step, 4, 3)
    );
    expect(stops.map((stop) => stop.slot)).toEqual([0, 1, 2, 3, 0, 1, 2]);
    expect(stops.map((stop) => stop.reads)).toEqual([
      false,
      false,
      true,
      false,
      false,
      true,
      false,
    ]);
  });

  test("files a repository with its GitHub facts and links", () => {
    const [card] = catalogOf([
      {
        ...repository("cache-components", "TypeScript", 5, "Granular caching."),
        forks: 2,
        homepage: "https://cache-components-granular.vercel.app",
        topics: ["nextjs", "caching"],
        visibility: "public-template",
      },
    ]).cards;
    expect(card && repositoryFile(card, 0, 6, "GH-04")).toEqual({
      chips: { items: ["nextjs", "caching"], label: "Topics" },
      code: "GH-04 · File 01/06",
      fields: [
        { label: "Language", value: "TypeScript" },
        { label: "Stars", value: "5" },
        { label: "Forks", value: "2" },
        { label: "Visibility", value: "Public template" },
        { label: "Created", value: "30 Jan 2026" },
        { label: "Last push", value: "9 Apr 2026" },
      ],
      kicker: "IvanTsxx/cache-components",
      links: [
        {
          href: "https://github.com/IvanTsxx/cache-components",
          label: "GitHub",
        },
        {
          href: "https://cache-components-granular.vercel.app",
          label: "cache-components-granular.vercel.app",
        },
      ],
      note: { label: "Description", text: "Granular caching." },
      title: "cache-components",
    });
  });

  test("leaves out the note, topics and homepage a repository lacks", () => {
    const [card] = catalogOf([repository("notes", null, 0)]).cards;
    const file = card && repositoryFile(card, 1, 2, "GH-04");
    expect(file?.note).toBeNull();
    expect(file?.chips).toBeNull();
    expect(file?.links.map((link) => link.label)).toEqual(["GitHub"]);
  });
});
