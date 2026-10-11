import { NoteFilters } from "@/components/content/note-filters";
import { DossierPanel } from "@/components/site/compact-dossier";
import { PageAside } from "@/components/site/page-aside";
import { countNoteFacets } from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";

export const NotesPanels = async () => {
  const notes = await getNotes();
  return (
    <PageAside code="NT-02" columns="single" label="Notes filters">
      <DossierPanel collapsible jp="絞込" label="Filter">
        <NoteFilters facets={countNoteFacets(notes)} total={notes.length} />
      </DossierPanel>
    </PageAside>
  );
};
