import type { Metadata } from "next";

import { siteConfig } from "@/lib/site/config";

import { notePath } from "./note-domain";
import type { FieldNote, Note } from "./note-domain";

export const isIndexable = (entry: { sample: boolean }) => !entry.sample;

export const absoluteUrl = (pathname: string) =>
  new URL(pathname, siteConfig.url).toString();

const robotsFor = (entry: { sample: boolean }): Metadata["robots"] =>
  isIndexable(entry) ? undefined : { follow: true, index: false };

const openGraphFor = (note: Note): Metadata["openGraph"] =>
  note.kind === "note"
    ? {
        authors: [siteConfig.nickname],
        description: note.summary,
        publishedTime: `${note.date}T00:00:00.000Z`,
        siteName: siteConfig.nickname,
        tags: note.tags,
        title: note.title,
        type: "article",
        url: notePath(note.slug),
      }
    : {
        description: note.summary,
        siteName: siteConfig.nickname,
        title: `${note.title} · ${siteConfig.nickname}`,
        type: "website",
        url: notePath(note.slug),
      };

export const buildNoteMetadata = (note: Note): Metadata => ({
  alternates: { canonical: notePath(note.slug) },
  authors: [{ name: siteConfig.nickname, url: siteConfig.url }],
  description: note.summary,
  keywords: note.kind === "note" ? note.tags : note.stack,
  openGraph: openGraphFor(note),
  robots: robotsFor(note),
  title: note.title,
});

export const buildNoteJsonLd = (note: FieldNote) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  author: {
    "@type": "Person",
    name: siteConfig.nickname,
    url: siteConfig.url,
  },
  datePublished: note.date,
  description: note.summary,
  headline: note.title,
  keywords: note.tags.join(", "),
  mainEntityOfPage: absoluteUrl(notePath(note.slug)),
});
