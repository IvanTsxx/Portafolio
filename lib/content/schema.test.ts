import { describe, expect, test } from "bun:test";

import { blogMetaSchema, slugPattern, workMetaSchema } from "./schema";

const validWork = {
  context: "Sample entry",
  responsibilities: ["Motion tokens"],
  role: "Frontend engineer",
  summary: "A summary",
  technologies: ["Next.js"],
  title: "Project",
  year: 2026,
};

const validPost = {
  date: "2026-10-09",
  summary: "A summary",
  tags: ["Workflow"],
  title: "Post",
};

describe("workMetaSchema", () => {
  test("applies defaults for optional collections and flags", () => {
    const parsed = workMetaSchema.parse(validWork);
    expect(parsed.featured).toBe(false);
    expect(parsed.sample).toBe(false);
    expect(parsed.related).toEqual([]);
    expect(parsed.previews).toEqual([]);
    expect(parsed.links).toEqual([]);
  });

  test("rejects unknown keys such as a hand-written slug", () => {
    const result = workMetaSchema.safeParse({ ...validWork, slug: "project" });
    expect(result.success).toBe(false);
  });

  test("rejects a missing title", () => {
    const { title: _title, ...withoutTitle } = validWork;
    expect(workMetaSchema.safeParse(withoutTitle).success).toBe(false);
  });

  test("rejects an empty technologies list and duplicate entries", () => {
    expect(
      workMetaSchema.safeParse({ ...validWork, technologies: [] }).success
    ).toBe(false);
    expect(
      workMetaSchema.safeParse({
        ...validWork,
        technologies: ["GSAP", "GSAP"],
      }).success
    ).toBe(false);
  });

  test("rejects a year outside a sane range", () => {
    expect(workMetaSchema.safeParse({ ...validWork, year: 1850 }).success).toBe(
      false
    );
  });

  test("rejects a summary longer than 280 characters", () => {
    expect(
      workMetaSchema.safeParse({ ...validWork, summary: "x".repeat(281) })
        .success
    ).toBe(false);
  });

  test("rejects related entries that are not slugs", () => {
    expect(
      workMetaSchema.safeParse({ ...validWork, related: ["Not A Slug"] })
        .success
    ).toBe(false);
  });

  test("accepts image and video previews and rejects an unknown kind", () => {
    const image = {
      alt: "Screenshot",
      height: 900,
      kind: "image",
      src: "/work/example.png",
      width: 1600,
    };
    const video = { ...image, kind: "video", poster: "/work/poster.png" };
    expect(
      workMetaSchema.safeParse({ ...validWork, previews: [image, video] })
        .success
    ).toBe(true);
    expect(
      workMetaSchema.safeParse({
        ...validWork,
        previews: [{ ...image, kind: "audio" }],
      }).success
    ).toBe(false);
  });

  test("rejects links that are neither URLs nor root-relative paths", () => {
    expect(
      workMetaSchema.safeParse({
        ...validWork,
        links: [{ href: "example.com", label: "Site" }],
      }).success
    ).toBe(false);
  });
});

describe("blogMetaSchema", () => {
  test("accepts a valid post and defaults sample to false", () => {
    expect(blogMetaSchema.parse(validPost).sample).toBe(false);
  });

  test("rejects a date that is not a calendar day", () => {
    expect(
      blogMetaSchema.safeParse({ ...validPost, date: "2026-02-31" }).success
    ).toBe(false);
    expect(
      blogMetaSchema.safeParse({ ...validPost, date: "October 9" }).success
    ).toBe(false);
  });

  test("rejects a post without tags", () => {
    expect(blogMetaSchema.safeParse({ ...validPost, tags: [] }).success).toBe(
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
