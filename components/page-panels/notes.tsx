import { NoteFilters } from "@/components/content/note-filters";
import { AsidePanel, PageAside } from "@/components/site/page-aside";
import { countNoteFacets } from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";

export const NotesPanels = async () => {
  const notes = await getNotes();
  return (
    <PageAside code="NT-02" label="Notes filters">
      <AsidePanel collapsible jp="絞込" label="Filter">
        <NoteFilters facets={countNoteFacets(notes)} total={notes.length} />
      </AsidePanel>
    </PageAside>
  );
};
