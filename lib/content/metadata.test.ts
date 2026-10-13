import { describe, expect, test } from "bun:test";

import { siteConfig } from "@/lib/site/config";
import { noteJsonLd } from "@/lib/site/structured-data";

import { buildNoteMetadata } from "./metadata";
import type { CaseStudy, FieldNote } from "./note-domain";

const note: FieldNote = {
  date: "2026-10-09",
  kind: "note",
  readingTimeMinutes: 3,
  related: [],
  sample: false,
  slug: "worktrees-as-lanes",
  summary: "Summary of the note",
  tags: ["Conductor", "Workflow"],
  title: "Worktrees as lanes",
  wordCount: 600,
};

const caseStudy: CaseStudy = {
  aiWorkflowNotes: [],
  context: "Context",
  date: "2026-06-01",
  featured: false,
  kind: "case-study",
  links: [],
  motionNotes: [],
  previews: [],
  readingTimeMinutes: 2,
  related: [],
  responsibilities: ["Motion"],
  role: "Frontend engineer",
  sample: false,
  slug: "editorial-motion-system",
  stack: ["GSAP"],
  summary: "Summary of the case study",
  title: "Editorial motion system",
  wordCount: 300,
};

describe("note metadata", () => {
  test("points canonical and Open Graph URLs at /notes for both kinds", () => {
    for (const entry of [note, caseStudy]) {
      const metadata = buildNoteMetadata(entry);

      expect(metadata.alternates?.canonical).toBe(`/notes/${entry.slug}`);
      expect(metadata.openGraph?.url).toBe(`/notes/${entry.slug}`);
      expect(metadata.description).toStartWith(entry.summary);
    }
  });

  test("describes a note as an article with its publish date and tags", () => {
    expect(buildNoteMetadata(note).openGraph).toMatchObject({
      publishedTime: "2026-10-09T00:00:00.000Z",
      tags: ["Conductor", "Workflow"],
      type: "article",
    });
    expect(buildNoteMetadata(caseStudy).openGraph).toMatchObject({
      type: "website",
    });
  });

  test("keeps sample entries out of search results and real ones in", () => {
    expect(buildNoteMetadata({ ...caseStudy, sample: true }).robots).toEqual({
      follow: true,
      index: false,
    });
    expect(buildNoteMetadata({ ...note, sample: true }).robots).toEqual({
      follow: true,
      index: false,
    });
    expect(buildNoteMetadata(note).robots).toBeUndefined();
  });

  test("builds BlogPosting structured data with an absolute URL", () => {
    const [posting, breadcrumb] = noteJsonLd(note)["@graph"];

    expect(posting).toMatchObject({
      "@type": "BlogPosting",
      datePublished: "2026-10-09",
      mainEntityOfPage: `${siteConfig.url}/notes/worktrees-as-lanes`,
    });
    expect(breadcrumb?.["@type"]).toBe("BreadcrumbList");
  });
});
