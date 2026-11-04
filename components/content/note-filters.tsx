"use client";

import { FilterBar } from "@/components/content/filter-bar";
import { useNoteFilter } from "@/components/content/use-note-filter";
import type { NoteFacets } from "@/lib/content/note-domain";

export const NoteFilters = ({
  facets,
  total,
}: {
  facets: NoteFacets;
  total: number;
}) => {
  const { filter, setTag } = useNoteFilter(facets);

  return (
    <FilterBar
      active={filter.tag ?? ""}
      facets={facets.tags}
      label="Topic"
      onChange={setTag}
      total={total}
    />
  );
};
