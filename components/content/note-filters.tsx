"use client";

import { FilterBar } from "@/components/content/filter-bar";
import { useNoteFilter } from "@/components/content/use-note-filter";
import { chipClassName } from "@/components/site/styles";
import { noteKinds } from "@/lib/content/note-domain";
import type { NoteFacets } from "@/lib/content/note-domain";
import { cn } from "@/lib/utils";

export const NoteFilters = ({
  facets,
  total,
}: {
  facets: NoteFacets;
  total: number;
}) => {
  const { clear, filter, isFiltered, setKind, setStack, setTag } =
    useNoteFilter(facets);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <FilterBar
        active={filter.kind ?? ""}
        facets={facets.kinds.map(({ count, kind }) => ({
          count,
          label: noteKinds[kind].label,
          name: kind,
        }))}
        jp="種別"
        label="Kind"
        onChange={setKind}
        total={total}
      />
      <FilterBar
        active={filter.tag ?? ""}
        facets={facets.tags}
        jp="札"
        label="Tag"
        onChange={setTag}
        total={total}
      />
      <FilterBar
        active={filter.stack ?? ""}
        facets={facets.stack}
        jp="技術"
        label="Stack"
        onChange={setStack}
        total={total}
      />
      <button
        className={cn(
          chipClassName,
          "w-fit disabled:cursor-not-allowed disabled:opacity-40 lg:col-span-3"
        )}
        disabled={!isFiltered}
        onClick={clear}
        type="button"
      >
        Clear filters
      </button>
    </div>
  );
};
