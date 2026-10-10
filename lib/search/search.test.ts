import { describe, expect, test } from "bun:test";

import { countHits, searchEntries } from "./search";
import type { SearchEntry } from "./types";

const entry = (
  overrides: Partial<SearchEntry> & { id: string }
): SearchEntry => ({
  action: { href: "/", type: "route" },
  code: "00",
  detail: "",
  group: "notes",
  keywords: [],
  title: overrides.id,
  ...overrides,
});

const entries: SearchEntry[] = [
  entry({ group: "pages", id: "home", title: "Home" }),
  entry({
    detail: "Note · Conductor, Workflow",
    group: "notes",
    id: "worktrees",
    keywords: ["Each issue gets its own lane"],
    title: "Worktrees as lanes",
  }),
  entry({
    detail: "Case study · GSAP",
    group: "notes",
    id: "motion",
    keywords: ["Agents carry the animation brief"],
    title: "Editorial motion system",
  }),
  entry({
    detail: "Shader, WebGL",
    group: "lab",
    id: "dither",
    title: "Dither field",
  }),
  entry({
    detail: "Interface",
    group: "registry",
    id: "agent-card",
    title: "Agent card",
  }),
  entry({
    detail: "Home",
    group: "sections",
    id: "how",
    title: "How I work",
  }),
];

describe("searchEntries without a query", () => {
  test("lists every entry grouped in the fixed group order with no highlights", () => {
    const sections = searchEntries(entries, "  ");

    expect(sections.map((section) => section.group)).toEqual([
      "pages",
      "sections",
      "notes",
      "lab",
      "registry",
    ]);
    expect(countHits(sections)).toBe(entries.length);
    expect(
      sections
        .flatMap((section) => section.hits)
        .every(
          (hit) => hit.titleRanges.length === 0 && hit.detailRanges.length === 0
        )
    ).toBe(true);
  });

  test("keeps entries inside a group in index order", () => {
    const notes = searchEntries(entries, "").find(
      (section) => section.group === "notes"
    );

    expect(notes?.hits.map((hit) => hit.entry.id)).toEqual([
      "worktrees",
      "motion",
    ]);
  });
});

describe("searchEntries with a query", () => {
  test("returns nothing when no entry matches", () => {
    expect(searchEntries(entries, "zebra")).toEqual([]);
  });

  test("reports the highlight ranges of the title and the detail", () => {
    const [section] = searchEntries(entries, "worktrees conductor");
    const [hit] = section?.hits ?? [];

    expect(hit?.entry.id).toBe("worktrees");
    expect(hit?.titleRanges).toEqual([[0, 9]]);
    expect(hit?.detailRanges).toEqual([[7, 16]]);
  });

  test("ranks a title match above a keyword only match", () => {
    const ids = searchEntries(entries, "agent")
      .flatMap((section) => section.hits)
      .map((hit) => hit.entry.id);

    expect(ids[0]).toBe("agent-card");
    expect(ids).toContain("motion");
    expect(ids.indexOf("agent-card")).toBeLessThan(ids.indexOf("motion"));
  });

  test("puts the group with the best hit first", () => {
    const sections = searchEntries(entries, "agent");

    expect(sections[0]?.group).toBe("registry");
    expect(sections.map((section) => section.group)).toEqual([
      "registry",
      "notes",
    ]);
  });

  test("finds an entry through its keywords", () => {
    const ids = searchEntries(entries, "lane")
      .flatMap((section) => section.hits)
      .map((hit) => hit.entry.id);

    expect(ids).toEqual(["worktrees"]);
  });

  test("never surfaces an entry through a scattered match in text the palette does not show", () => {
    const hidden = [
      entry({
        detail: "Shader, WebGL",
        id: "dither",
        keywords: ["ShaderMaterial"],
        title: "Dither field",
      }),
    ];

    expect(searchEntries(hidden, "email")).toEqual([]);
    expect(searchEntries(hidden, "material")).toHaveLength(1);
  });

  test("tolerates a skipped letter in a title", () => {
    const ids = searchEntries(entries, "wktrees")
      .flatMap((section) => section.hits)
      .map((hit) => hit.entry.id);

    expect(ids).toEqual(["worktrees"]);
  });

  test("ranks the same way no matter how the entries are ordered", () => {
    const reversed = entries.toReversed();
    const forward = searchEntries(entries, "agent").flatMap((section) =>
      section.hits.map((hit) => hit.entry.id)
    );
    const backward = searchEntries(reversed, "agent").flatMap((section) =>
      section.hits.map((hit) => hit.entry.id)
    );

    expect(backward).toEqual(forward);
  });
});
