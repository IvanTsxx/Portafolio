import { describe, expect, test } from "bun:test";

import { siteConfig } from "@/lib/site/config";

import type { BlogPost } from "./blog";
import {
  buildPostJsonLd,
  buildPostMetadata,
  buildWorkMetadata,
} from "./metadata";
import type { WorkProject } from "./work";

const post: BlogPost = {
  date: "2026-10-09",
  readingTimeMinutes: 3,
  sample: false,
  slug: "worktrees-as-lanes",
  summary: "Summary of the post",
  tags: ["Conductor", "Workflow"],
  title: "Worktrees as lanes",
  wordCount: 600,
};

const project: WorkProject = {
  aiWorkflowNotes: [],
  context: "Context",
  featured: false,
  links: [],
  motionNotes: [],
  previews: [],
  readingTimeMinutes: 2,
  related: [],
  responsibilities: ["Motion"],
  role: "Frontend engineer",
  sample: false,
  slug: "editorial-motion-system",
  summary: "Summary of the project",
  technologies: ["GSAP"],
  title: "Editorial motion system",
  wordCount: 300,
  year: 2026,
};

describe("work metadata", () => {
  test("points the canonical URL and Open Graph URL at the case study", () => {
    const metadata = buildWorkMetadata(project);

    expect(metadata.alternates?.canonical).toBe(
      "/work/editorial-motion-system"
    );
    expect(metadata.openGraph?.url).toBe("/work/editorial-motion-system");
    expect(metadata.description).toBe("Summary of the project");
  });

  test("keeps sample projects out of search results and real ones in", () => {
    expect(buildWorkMetadata({ ...project, sample: true }).robots).toEqual({
      follow: true,
      index: false,
    });
    expect(buildWorkMetadata(project).robots).toBeUndefined();
  });
});

describe("post metadata", () => {
  test("describes the post as an article with its publish date and tags", () => {
    const metadata = buildPostMetadata(post);

    expect(metadata.openGraph).toMatchObject({
      publishedTime: "2026-10-09T00:00:00.000Z",
      tags: ["Conductor", "Workflow"],
      type: "article",
    });
    expect(metadata.alternates?.canonical).toBe("/blog/worktrees-as-lanes");
  });

  test("keeps sample posts out of search results and real ones in", () => {
    expect(buildPostMetadata({ ...post, sample: true }).robots).toEqual({
      follow: true,
      index: false,
    });
    expect(buildPostMetadata(post).robots).toBeUndefined();
  });

  test("builds BlogPosting structured data with an absolute URL", () => {
    const jsonLd = buildPostJsonLd(post);

    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.datePublished).toBe("2026-10-09");
    expect(jsonLd.mainEntityOfPage).toBe(
      `${siteConfig.url}/blog/worktrees-as-lanes`
    );
  });
});
