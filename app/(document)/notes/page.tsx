import { NoteArchive } from "@/components/content/note-archive";
import { NoteFilters } from "@/components/content/note-filters";
import { DocumentHero } from "@/components/site/document-hero";
import { FilterFold } from "@/components/site/filter-fold";
import { JsonLd } from "@/components/site/json-ld";
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
      <FilterFold>
        <NoteFilters facets={facets} total={notes.length} />
      </FilterFold>
      <NoteArchive facets={facets} notes={notes.map(toNoteIndexItem)} />
    </>
  );
};

export default NotesPage;
