import { describe, expect, test } from "bun:test";

import { caseStudyMetaSchema, noteMetaSchema, slugPattern } from "./schema";

const validWork = {
  context: "Sample entry",
  kind: "case-study",
  responsibilities: ["Motion tokens"],
  role: "Frontend engineer",
  stack: ["Next.js"],
  summary: "A summary",
  title: "Project",
  year: 2026,
};

const validPost = {
  date: "2026-10-09",
  kind: "note",
  summary: "A summary",
  tags: ["Workflow"],
  title: "Post",
};

describe("note kinds", () => {
  test("rejects an entry without a kind or with an unknown kind", () => {
    const { kind: _kind, ...withoutKind } = validPost;

    expect(noteMetaSchema.safeParse(withoutKind).success).toBe(false);
    expect(
      noteMetaSchema.safeParse({ ...validPost, kind: "essay" }).success
    ).toBe(false);
  });

  test("rejects fields that belong to the other kind", () => {
    expect(
      noteMetaSchema.safeParse({ ...validPost, stack: ["GSAP"] }).success
    ).toBe(false);
    expect(
      noteMetaSchema.safeParse({ ...validWork, date: "2026-10-09" }).success
    ).toBe(false);
  });
});

describe("case study meta", () => {
  test("applies defaults for optional collections and flags", () => {
    const parsed = caseStudyMetaSchema.parse(validWork);
    expect(parsed.featured).toBe(false);
    expect(parsed.sample).toBe(false);
    expect(parsed.related).toEqual([]);
    expect(parsed.previews).toEqual([]);
    expect(parsed.links).toEqual([]);
  });

  test("rejects unknown keys such as a hand-written slug", () => {
    const result = noteMetaSchema.safeParse({ ...validWork, slug: "project" });
    expect(result.success).toBe(false);
  });

  test("rejects a missing title", () => {
    const { title: _title, ...withoutTitle } = validWork;
    expect(noteMetaSchema.safeParse(withoutTitle).success).toBe(false);
  });

  test("rejects an empty stack list and duplicate entries", () => {
    expect(noteMetaSchema.safeParse({ ...validWork, stack: [] }).success).toBe(
      false
    );
    expect(
      noteMetaSchema.safeParse({
        ...validWork,
        stack: ["GSAP", "GSAP"],
      }).success
    ).toBe(false);
  });

  test("rejects a year outside a sane range", () => {
    expect(noteMetaSchema.safeParse({ ...validWork, year: 1850 }).success).toBe(
      false
    );
  });

  test("rejects a summary longer than 280 characters", () => {
    expect(
      noteMetaSchema.safeParse({ ...validWork, summary: "x".repeat(281) })
        .success
    ).toBe(false);
  });

  test("rejects related entries that are not slugs", () => {
    expect(
      noteMetaSchema.safeParse({ ...validWork, related: ["Not A Slug"] })
        .success
    ).toBe(false);
  });

  test("accepts image and video previews and rejects an unknown kind", () => {
    const image = {
      alt: "Screenshot",
      height: 900,
      kind: "image",
      src: "/notes/example.png",
      width: 1600,
    };
    const video = { ...image, kind: "video", poster: "/notes/poster.png" };
    expect(
      noteMetaSchema.safeParse({ ...validWork, previews: [image, video] })
        .success
    ).toBe(true);
    expect(
      noteMetaSchema.safeParse({
        ...validWork,
        previews: [{ ...image, kind: "audio" }],
      }).success
    ).toBe(false);
  });

  test("rejects links that are neither URLs nor root-relative paths", () => {
    expect(
      noteMetaSchema.safeParse({
        ...validWork,
        links: [{ href: "example.com", label: "Site" }],
      }).success
    ).toBe(false);
  });
});

describe("note meta", () => {
  test("accepts a valid post and defaults sample to false", () => {
    expect(noteMetaSchema.parse(validPost).sample).toBe(false);
  });

  test("rejects a date that is not a calendar day", () => {
    expect(
      noteMetaSchema.safeParse({ ...validPost, date: "2026-02-31" }).success
    ).toBe(false);
    expect(
      noteMetaSchema.safeParse({ ...validPost, date: "October 9" }).success
    ).toBe(false);
  });

  test("rejects a post without tags", () => {
    expect(noteMetaSchema.safeParse({ ...validPost, tags: [] }).success).toBe(
      false
    );
  });
});

describe("slugPattern", () => {
  test("accepts kebab-case and rejects everything else", () => {
    expect(slugPattern.test("worktrees-as-lanes")).toBe(true);
    expect(slugPattern.test("Worktrees")).toBe(false);
    expect(slugPattern.test("double--hyphen")).toBe(false);
    expect(slugPattern.test("../escape")).toBe(false);
  });
});
