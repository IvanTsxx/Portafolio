import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { ContentDocument } from "./collection";
import { noteSource } from "./note-domain";
import { getNote, getNotes, getNoteSlugs } from "./notes";
import { removeMetaExport } from "./text";

const passthrough = ({ children }: { children?: ReactNode }) =>
  createElement("div", null, children);

const blockStubs = {
  Callout: passthrough,
  Demo: passthrough,
  Diagram: passthrough,
  Figure: () => null,
  NoteList: () => null,
  Step: passthrough,
  Steps: passthrough,
  Table: passthrough,
  Video: () => null,
};

const renderedHeadingIds = (html: string) =>
  (html.match(/<h[23] id="[^"]+"/gu) ?? []).map((tag) =>
    tag.slice(tag.indexOf('id="') + 4, -1)
  );

const compareHeadingIds = (
  slugs: readonly string[],
  load: (slug: string) => Promise<ContentDocument<object> | undefined>
) =>
  Promise.all(
    slugs.map(async (slug) => {
      const document = await load(slug);
      if (!document) {
        throw new Error(`${slug} did not load`);
      }
      const html = renderToStaticMarkup(
        createElement(document.Content, { components: blockStubs })
      );
      return {
        expected: document.headings.map((heading) => heading.id),
        rendered: renderedHeadingIds(html),
        slug,
      };
    })
  );

describe("shipped notes", () => {
  test("every entry passes its schema and relations resolve", async () => {
    const [notes, slugs] = await Promise.all([getNotes(), getNoteSlugs()]);

    expect(notes.map((item) => item.slug).toSorted()).toEqual(slugs);
    expect(
      notes.filter((item) => item.kind === "case-study").length
    ).toBeGreaterThan(0);
    expect(notes.filter((item) => item.kind === "note").length).toBeGreaterThan(
      0
    );
  });

  test("is ordered newest first across both kinds", async () => {
    const notes = await getNotes();
    const keys = notes.map((item) =>
      item.kind === "note" ? item.date : String(item.year)
    );

    expect(keys).toEqual(keys.toSorted().toReversed());
  });

  test("labels every non-real entry as sample content", async () => {
    const notes = await getNotes();

    expect(notes.every((item) => item.sample)).toBe(true);
  });

  test("reading time comes from the prose and not from the meta block", async () => {
    const notes = await getNotes();
    const sources = await Promise.all(
      notes.map((note) =>
        readFile(path.join(process.cwd(), noteSource(note.slug)), "utf-8")
      )
    );

    for (const [index, note] of notes.entries()) {
      const source = sources[index] ?? "";
      expect(removeMetaExport(source)).not.toContain("export const meta");
      expect(note.wordCount).toBeGreaterThan(50);
      expect(note.readingTimeMinutes).toBe(Math.ceil(note.wordCount / 220));
    }
  });

  test("table of contents ids match the ids rendered into the page", async () => {
    const slugs = await getNoteSlugs();
    const results = await compareHeadingIds(slugs, getNote);

    for (const result of results) {
      expect({ ids: result.rendered, slug: result.slug }).toEqual({
        ids: result.expected,
        slug: result.slug,
      });
    }
  });
});
