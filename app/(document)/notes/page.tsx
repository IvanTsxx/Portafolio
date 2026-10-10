import type { Metadata } from "next";

import { NoteArchive } from "@/components/content/note-archive";
import { NotesPanels } from "@/components/page-panels/notes";
import { DocumentHero } from "@/components/site/document-hero";
import {
  countNoteFacets,
  noteKinds,
  toNoteIndexItem,
} from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";
import { siteConfig } from "@/lib/site/config";

const description =
  "Builds and thoughts. Case studies and notes on agents, motion and frontend craft.";

export const metadata: Metadata = {
  alternates: { canonical: "/notes" },
  description,
  openGraph: {
    description,
    siteName: siteConfig.name,
    title: `Notes · ${siteConfig.shortName}`,
    type: "website",
    url: "/notes",
  },
  title: "Notes",
};

const pad = (value: number) => String(value).padStart(2, "0");

const NotesPage = async () => {
  const notes = await getNotes();
  const facets = countNoteFacets(notes);

  return (
    <>
      <DocumentHero
        code="NT-01"
        jp="手記"
        lede="Builds and thoughts"
        meta={[
          { label: "Entries", value: pad(notes.length) },
          ...facets.kinds.map(({ count, kind }) => ({
            label: noteKinds[kind].plural,
            value: pad(count),
          })),
        ]}
        title="Notes"
      />
      <NotesPanels />
      <NoteArchive facets={facets} notes={notes.map(toNoteIndexItem)} />
    </>
  );
};

export default NotesPage;
