import { describe, expect, test } from "bun:test";

import type { PinnedRepository } from "@/lib/github/model";

import { openingPickOf, specimensOf, swatchesOf } from "./repositories";

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

describe("repository specimens", () => {
  test("gives the most common language the darkest swatch", () => {
    const swatches = swatchesOf([
      repository("a", "Python", 1),
      repository("b", "TypeScript", 2),
      repository("c", "TypeScript", 3),
      repository("d", null, 0),
      repository("e", "Go", 0),
      repository("f", "Rust", 0),
    ]);
    expect(Object.fromEntries(swatches)).toEqual({
      Go: "graphite",
      Python: "mist",
      Rust: "hollow",
      TypeScript: "ink",
      Unknown: "hollow",
    });
  });

  test("prints owner and name apart and links the repository on GitHub", () => {
    const [specimen] = specimensOf(
      [repository("better-auth-mp", "Python", 5, "Mercado Pago plugin.")],
      "GH-04"
    );
    expect(specimen?.owner).toBe("IvanTsxx");
    expect(specimen?.name).toBe("better-auth-mp");
    expect(specimen?.url).toBe("https://github.com/IvanTsxx/better-auth-mp");
    expect(specimen?.pushed).toBe("9 Apr 2026");
    expect(specimen?.spoken).toBe(
      "IvanTsxx/better-auth-mp, Python, 5 stars, 0 forks"
    );
  });

  test("shows three topics at rest and counts the rest", () => {
    const [specimen] = specimensOf(
      [
        {
          ...repository("cache", "TypeScript", 5),
          topics: ["nextjs", "caching", "demo", "example", "ppr"],
        },
      ],
      "GH-04"
    );
    expect(specimen?.topics).toEqual(["nextjs", "caching", "demo"]);
    expect(specimen?.topicsLeft).toBe(2);
    expect(specimen?.file.chips?.items).toHaveLength(5);
  });

  test("files a repository with its GitHub facts and links", () => {
    const [specimen] = specimensOf(
      [
        {
          ...repository(
            "cache-components",
            "TypeScript",
            5,
            "Granular caching."
          ),
          forks: 2,
          homepage: "https://cache-components-granular.vercel.app",
          topics: ["nextjs", "caching"],
          visibility: "public-template",
        },
        repository("notes", null, 0),
      ],
      "GH-04"
    );
    expect(specimen?.visibility).toBe("Public template");
    expect(specimen?.file).toEqual({
      chips: { items: ["nextjs", "caching"], label: "Topics" },
      code: "GH-04 · File 01/02",
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
    const [specimen] = specimensOf([repository("notes", null, 0)], "GH-04");
    expect(specimen?.language).toBe("Unknown");
    expect(specimen?.file.note).toBeNull();
    expect(specimen?.file.chips).toBeNull();
    expect(specimen?.file.links.map((link) => link.label)).toEqual(["GitHub"]);
  });
});

const pushed = (name: string, stars: number, pushedAt: string) => ({
  ...repository(name, "TypeScript", stars),
  pushedAt,
});

describe("opening tape", () => {
  test("is the most starred repository", () => {
    const specimens = specimensOf(
      [
        pushed("a", 2, "2026-05-01"),
        pushed("b", 9, "2025-01-01"),
        pushed("c", 4, "2026-06-01"),
      ],
      "GH-03"
    );
    expect(specimens[openingPickOf(specimens) ?? -1]?.name).toBe("b");
  });

  test("breaks a star tie with the most recent push", () => {
    const specimens = specimensOf(
      [
        pushed("older", 7, "2026-03-01"),
        pushed("newer", 7, "2026-08-14"),
        pushed("oldest", 7, "2025-12-01"),
      ],
      "GH-03"
    );
    expect(specimens[openingPickOf(specimens) ?? -1]?.name).toBe("newer");
  });

  test("is none without repositories", () => {
    expect(openingPickOf([])).toBeNull();
  });
});
