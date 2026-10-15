import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { PinnedRepository } from "@/lib/github/model";

import { CassetteTower } from "./cassette-tower";
import { specimensOf } from "./repositories";

const repository = (
  name: string,
  stars: number,
  pushedAt: string
): PinnedRepository => ({
  createdAt: "2026-01-30",
  description: `${name} description`,
  forks: 0,
  homepage: null,
  language: "TypeScript",
  name,
  nameWithOwner: `IvanTsxx/${name}`,
  pushedAt,
  stars,
  topics: [],
  visibility: "public",
});

const markup = renderToStaticMarkup(
  <CassetteTower
    specimens={specimensOf(
      [
        repository("notes", 3, "2026-08-01"),
        repository("kit", 8, "2026-02-01"),
        repository("cache", 8, "2026-07-01"),
      ],
      "GH-03"
    )}
  />
);

const tapeItemOf = (name: string) =>
  markup
    .split("<li")
    .find((item) =>
      item.includes(`href="https://github.com/IvanTsxx/${name}"`)
    );

const tapeTagOf = (name: string) => tapeItemOf(name)?.match(/<a[^>]*>/u)?.[0];

const jCards = [
  ...markup.matchAll(/<div aria-hidden="(?:true|false)"[^>]*>/gu),
].map(([tag]) => tag);

describe("cassette tower", () => {
  test("server renders the most starred, most recently pushed tape slid out", () => {
    expect(tapeTagOf("cache")).toContain('aria-expanded="true"');
    expect(tapeTagOf("kit")).toContain('aria-expanded="false"');
    expect(tapeTagOf("notes")).toContain('aria-expanded="false"');
    expect(tapeItemOf("cache")).toContain('data-open="true"');
    expect(tapeItemOf("kit")).not.toContain('data-open="true"');
  });

  test("server renders its J-card unfolded and hides the others", () => {
    expect(jCards).toHaveLength(3);
    expect(jCards[2]).toContain('aria-hidden="false"');
    expect(jCards[2]).toContain('data-open="true"');
    expect(jCards[2]).not.toContain("inert");
    expect(jCards[0]).toContain('inert=""');
    expect(jCards[1]).toContain('inert=""');
  });

  test("keeps every tape a GitHub link and marks buildable blocks", () => {
    expect(markup.match(/data-pick=/gu)).toHaveLength(3);
    expect(markup).toContain("data-build-block");
  });
});
