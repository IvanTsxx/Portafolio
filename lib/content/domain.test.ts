import { describe, expect, test } from "bun:test";

import {
  comparePosts,
  filterPosts,
  findAdjacentPosts,
  rankRelatedPosts,
} from "./blog";
import type { BlogPost } from "./blog";
import { countFacets } from "./facets";
import { isIndexable } from "./metadata";
import {
  compareProjects,
  filterProjects,
  findRelationIssues,
  pickRelatedProjects,
} from "./work";
import type { WorkProject } from "./work";

const project = (
  overrides: Partial<WorkProject> & { slug: string }
): WorkProject => ({
  aiWorkflowNotes: [],
  context: "Context",
  featured: false,
  links: [],
  motionNotes: [],
  previews: [],
  readingTimeMinutes: 1,
  related: [],
  responsibilities: ["Responsibility"],
  role: "Role",
  sample: false,
  summary: "Summary",
  technologies: ["Next.js"],
  title: overrides.slug,
  wordCount: 10,
  year: 2026,
  ...overrides,
});

const post = (overrides: Partial<BlogPost> & { slug: string }): BlogPost => ({
  date: "2026-10-01",
  readingTimeMinutes: 1,
  sample: false,
  summary: "Summary",
  tags: ["Workflow"],
  title: overrides.slug,
  wordCount: 10,
  ...overrides,
});

describe("project ordering and filtering", () => {
  test("sorts newest year first and breaks ties by title", () => {
    const sorted = [
      project({ slug: "b", title: "Bravo", year: 2024 }),
      project({ slug: "a", title: "Alpha", year: 2026 }),
      project({ slug: "c", title: "Charlie", year: 2026 }),
    ].toSorted(compareProjects);

    expect(sorted.map((item) => item.slug)).toEqual(["a", "c", "b"]);
  });

  test("filters by technology and by featured flag", () => {
    const projects = [
      project({ featured: true, slug: "a", technologies: ["GSAP", "Next.js"] }),
      project({ slug: "b", technologies: ["Next.js"] }),
    ];

    expect(
      filterProjects(projects, { technology: "GSAP" }).map((item) => item.slug)
    ).toEqual(["a"]);
    expect(
      filterProjects(projects, { featured: true }).map((item) => item.slug)
    ).toEqual(["a"]);
    expect(
      filterProjects(projects, { featured: false }).map((item) => item.slug)
    ).toEqual(["b"]);
    expect(filterProjects(projects)).toHaveLength(2);
  });

  test("reports related slugs that do not exist and self references", () => {
    const issues = findRelationIssues([
      project({ related: ["ghost", "a"], slug: "a" }),
      project({ related: ["a"], slug: "b" }),
    ]);

    expect(issues).toHaveLength(2);
    expect(issues.join(" ")).toContain('unknown project "ghost"');
    expect(issues.join(" ")).toContain("lists itself");
  });

  test("resolves related projects in the order the author listed them", () => {
    const b = project({ slug: "b" });
    const c = project({ slug: "c" });
    const main = project({ related: ["c", "b"], slug: "main" });

    expect(
      pickRelatedProjects([b, c, main], main).map((item) => item.slug)
    ).toEqual(["c", "b"]);
  });
});

describe("post ordering, related and adjacent", () => {
  const posts = [
    post({
      date: "2026-10-09",
      slug: "newest",
      tags: ["Conductor", "Workflow"],
    }),
    post({ date: "2026-10-07", slug: "middle", tags: ["Workflow"] }),
    post({ date: "2026-10-02", slug: "oldest", tags: ["MCP"] }),
  ];

  test("sorts newest first and breaks same-day ties by title", () => {
    const sorted = [
      post({ date: "2026-01-01", slug: "x", title: "Zed" }),
      post({ date: "2026-03-01", slug: "y", title: "Mid" }),
      post({ date: "2026-01-01", slug: "z", title: "Abe" }),
    ].toSorted(comparePosts);

    expect(sorted.map((item) => item.slug)).toEqual(["y", "z", "x"]);
  });

  test("filters by tag", () => {
    expect(filterPosts(posts, { tag: "MCP" }).map((item) => item.slug)).toEqual(
      ["oldest"]
    );
    expect(filterPosts(posts)).toHaveLength(3);
  });

  test("ranks related posts by shared tags and never includes the post itself", () => {
    const [newest] = posts;
    if (!newest) {
      throw new Error("fixture missing");
    }

    const related = rankRelatedPosts(posts, newest);

    expect(related.map((item) => item.slug)).toEqual(["middle"]);
  });

  test("respects the limit and the exclusion list", () => {
    const pool = [
      post({ date: "2026-10-09", slug: "current", tags: ["A", "B"] }),
      post({ date: "2026-10-08", slug: "one-shared", tags: ["A"] }),
      post({ date: "2026-10-07", slug: "two-shared", tags: ["A", "B"] }),
      post({ date: "2026-10-06", slug: "three", tags: ["B"] }),
    ];
    const [current] = pool;
    if (!current) {
      throw new Error("fixture missing");
    }

    expect(
      rankRelatedPosts(pool, current, { limit: 2 }).map((item) => item.slug)
    ).toEqual(["two-shared", "one-shared"]);
    expect(
      rankRelatedPosts(pool, current, {
        exclude: ["two-shared"],
        limit: 1,
      }).map((item) => item.slug)
    ).toEqual(["one-shared"]);
  });

  test("finds the newer and older neighbour and handles the ends", () => {
    expect(findAdjacentPosts(posts, "middle")).toEqual({
      newer: posts[0],
      older: posts[2],
    });
    expect(findAdjacentPosts(posts, "newest").newer).toBeUndefined();
    expect(findAdjacentPosts(posts, "oldest").older).toBeUndefined();
    expect(findAdjacentPosts(posts, "missing")).toEqual({
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
