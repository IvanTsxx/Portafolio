"use client";

import { useUrlFilter } from "@/components/content/use-url-filter";
import { isNoteKind } from "@/lib/content/note-domain";
import type { NoteFacets, NoteFilter } from "@/lib/content/note-domain";

const known = (value: string, facets: readonly { name: string }[]) =>
  facets.some((facet) => facet.name === value) ? value : undefined;

export const useNoteFilter = (facets: NoteFacets) => {
  const [kind, setKind] = useUrlFilter("kind");
  const [tag, setTag] = useUrlFilter("tag");
  const [stack, setStack] = useUrlFilter("stack");

  const filter: NoteFilter = {
    kind: isNoteKind(kind) ? kind : undefined,
    stack: known(stack, facets.stack),
    tag: known(tag, facets.tags),
  };

  const clear = () => {
    setKind("");
    setTag("");
    setStack("");
  };

  return {
    clear,
    filter,
    isFiltered: Object.values(filter).some((value) => value !== undefined),
    setKind,
    setStack,
    setTag,
  };
};
