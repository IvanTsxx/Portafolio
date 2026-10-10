import { describe, expect, test } from "bun:test";

import { countFacets } from "./facets";
import { isIndexable } from "./metadata";
import {
  compareNotes,
  countNoteFacets,
  findAdjacentNotes,
  findRelationIssues,
  matchesNoteFilter,
  pickRelatedNotes,
  toNoteIndexItem,
} from "./note-domain";
import type { CaseStudy, FieldNote, Note } from "./note-domain";

const caseStudy = (
  overrides: Partial<CaseStudy> & { slug: string }
): CaseStudy => ({
  aiWorkflowNotes: [],
  context: "Context",
  featured: false,
  kind: "case-study",
  links: [],
  motionNotes: [],
  previews: [],
  readingTimeMinutes: 1,
  related: [],
  responsibilities: ["Responsibility"],
  role: "Role",
  sample: false,
  stack: ["Next.js"],
  summary: "Summary",
  title: overrides.slug,
  wordCount: 10,
  year: 2026,
  ...overrides,
});

const fieldNote = (
  overrides: Partial<FieldNote> & { slug: string }
): FieldNote => ({
  date: "2026-10-01",
  kind: "note",
  readingTimeMinutes: 1,
  related: [],
  sample: false,
  summary: "Summary",
  tags: ["Workflow"],
  title: overrides.slug,
  wordCount: 10,
  ...overrides,
});

const slugsOf = (notes: readonly Note[]) => notes.map((note) => note.slug);

describe("ordering", () => {
  test("interleaves both kinds newest first and breaks ties by title", () => {
    const sorted = [
      caseStudy({ slug: "old-build", year: 2024 }),
      fieldNote({ date: "2026-10-09", slug: "fresh-note" }),
      caseStudy({ slug: "b-build", title: "Bravo", year: 2026 }),
      caseStudy({ slug: "a-build", title: "Alpha", year: 2026 }),
      fieldNote({ date: "2025-03-01", slug: "last-year-note" }),
    ].toSorted(compareNotes);

    expect(slugsOf(sorted)).toEqual([
      "fresh-note",
      "a-build",
      "b-build",
      "last-year-note",
      "old-build",
    ]);
  });
});

describe("filtering", () => {
  const items = [
    caseStudy({ slug: "build", stack: ["GSAP", "Next.js"] }),
    fieldNote({ slug: "note", tags: ["MCP"] }),
  ].map(toNoteIndexItem);
  const visible = (filter: Parameters<typeof matchesNoteFilter>[1]) =>
    items
      .filter((item) => matchesNoteFilter(item, filter))
      .map((item) => item.slug);

  test("keeps everything without a filter", () => {
    expect(visible({})).toEqual(["build", "note"]);
  });

  test("filters by kind, tag and stack and combines them with AND", () => {
    expect(visible({ kind: "note" })).toEqual(["note"]);
    expect(visible({ tag: "MCP" })).toEqual(["note"]);
    expect(visible({ stack: "GSAP" })).toEqual(["build"]);
    expect(visible({ kind: "case-study", tag: "MCP" })).toEqual([]);
  });

  test("counts kinds, tags and stack separately", () => {
    const facets = countNoteFacets([
      caseStudy({ slug: "a", stack: ["GSAP"] }),
      caseStudy({ slug: "b", stack: ["GSAP", "R3F"] }),
      fieldNote({ slug: "c", tags: ["MCP"] }),
    ]);

    expect(facets.kinds).toEqual([
      { count: 2, kind: "case-study" },
      { count: 1, kind: "note" },
    ]);
    expect(facets.stack).toEqual([
      { count: 2, name: "GSAP" },
      { count: 1, name: "R3F" },
    ]);
    expect(facets.tags).toEqual([{ count: 1, name: "MCP" }]);
  });
});

describe("relations", () => {
  test("reports related slugs that do not exist and self references", () => {
    const issues = findRelationIssues([
      caseStudy({ related: ["ghost", "a"], slug: "a" }),
      fieldNote({ related: ["a"], slug: "b" }),
    ]);

    expect(issues).toHaveLength(2);
    expect(issues.join(" ")).toContain('unknown note "ghost"');
    expect(issues.join(" ")).toContain("lists itself");
  });

  test("lists author picks first, then notes sharing the most topics", () => {
    const main = fieldNote({
      related: ["picked"],
      slug: "main",
      tags: ["A", "B"],
    });
    const pool = [
      main,
      fieldNote({ slug: "one-shared", tags: ["A"] }),
      fieldNote({ slug: "two-shared", tags: ["A", "B"] }),
      caseStudy({ slug: "picked", stack: ["Z"] }),
      fieldNote({ slug: "unrelated", tags: ["Q"] }),
    ];

    expect(slugsOf(pickRelatedNotes(pool, main, { limit: 3 }))).toEqual([
      "picked",
      "two-shared",
      "one-shared",
    ]);
    expect(
      slugsOf(pickRelatedNotes(pool, main, { exclude: ["picked"], limit: 1 }))
    ).toEqual(["two-shared"]);
  });

  test("matches a case study stack against a note tag", () => {
    const build = caseStudy({ slug: "build", stack: ["GSAP"] });
    const note = fieldNote({ slug: "note", tags: ["GSAP"] });

    expect(slugsOf(pickRelatedNotes([build, note], build))).toEqual(["note"]);
  });

  test("finds the newer and older neighbour and handles the ends", () => {
    const notes = [
      fieldNote({ slug: "newest" }),
      caseStudy({ slug: "middle" }),
      fieldNote({ slug: "oldest" }),
    ];

    expect(findAdjacentNotes(notes, "middle")).toEqual({
      newer: notes[0],
      older: notes[2],
    });
    expect(findAdjacentNotes(notes, "newest").newer).toBeUndefined();
    expect(findAdjacentNotes(notes, "oldest").older).toBeUndefined();
    expect(findAdjacentNotes(notes, "missing")).toEqual({
      newer: undefined,
      older: undefined,
    });
  });
});

describe("facets and indexing", () => {
  test("counts facets and sorts by count then name", () => {
    expect(countFacets([["B", "A"], ["A"], ["C", "A"], ["B"]])).toEqual([
      { count: 3, name: "A" },
      { count: 2, name: "B" },
      { count: 1, name: "C" },
    ]);
  });

  test("keeps sample content out of the index and real content in", () => {
    expect(isIndexable({ sample: true })).toBe(false);
    expect(isIndexable({ sample: false })).toBe(true);
  });
});
