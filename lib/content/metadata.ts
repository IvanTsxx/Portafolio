import type { Metadata } from "next";

import { siteConfig } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";
import type { PageSeo } from "@/lib/site/seo";

import { noteKinds, notePath } from "./note-domain";
import type { Note } from "./note-domain";

export const isIndexable = (entry: { sample: boolean }) => !entry.sample;

const topicsOf = (note: Note) =>
  note.kind === "note" ? note.tags : note.stack;

export const noteSeo = (note: Note): PageSeo => ({
  article:
    note.kind === "note"
      ? { publishedTime: `${note.date}T00:00:00.000Z`, tags: note.tags }
      : undefined,
  description: `${note.summary} ${noteKinds[note.kind].label} by ${siteConfig.nickname} on ${topicsOf(note).slice(0, 3).join(", ")}.`,
  indexable: isIndexable(note),
  keywords: topicsOf(note),
  path: notePath(note.slug),
  title: note.title,
});

export const buildNoteMetadata = (note: Note): Metadata => ({
  ...buildPageMetadata(noteSeo(note)),
  authors: [{ name: siteConfig.nickname, url: siteConfig.url }],
});
