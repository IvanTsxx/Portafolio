import { NoteArchive } from "@/components/content/note-archive";
import { NoteFilters } from "@/components/content/note-filters";
import { DocumentHero } from "@/components/site/document-hero";
import { JsonLd } from "@/components/site/json-ld";
import { PlatePage } from "@/components/site/plate-page";
import {
  countNoteFacets,
  noteKinds,
  toNoteIndexItem,
} from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { notesIndexJsonLd } from "@/lib/site/structured-data";

export const metadata = buildPageMetadata(pageSeo.notes);

const pad = (value: number) => String(value).padStart(2, "0");

const NotesPage = async () => {
  const notes = await getNotes();
  const facets = countNoteFacets(notes);

  return (
    <>
      <JsonLd data={notesIndexJsonLd(notes)} />
      <PlatePage
        plate={
          <DocumentHero
            code="Index · Writing"
            lede="Technical notes, breakdowns and things I learned the slow way."
            meta={[
              { label: "Entries", value: pad(notes.length) },
              ...facets.kinds.map(({ count, kind }) => ({
                label: noteKinds[kind].plural,
                value: pad(count),
              })),
            ]}
            title="Writing"
          />
        }
      >
        <div>
          <NoteFilters facets={facets} total={notes.length} />
        </div>
        <NoteArchive facets={facets} notes={notes.map(toNoteIndexItem)} />
      </PlatePage>
    </>
  );
};

export default NotesPage;
