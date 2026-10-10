import { cache } from "react";

import { getNotes } from "@/lib/content/notes";
import { sectionSpecs as designSystemSections } from "@/lib/design-system/sections";
import { experiments } from "@/lib/lab/experiments";
import { registryItems } from "@/lib/registry/registry";

import {
  channelEntries,
  experimentEntry,
  homeSectionEntries,
  noteEntry,
  pageEntries,
  registryEntry,
  sectionEntries,
} from "./entries";
import type { SearchEntry } from "./types";

export const buildSearchIndex = cache(async (): Promise<SearchEntry[]> => {
  const notes = await getNotes();
  return [
    ...pageEntries(),
    ...homeSectionEntries(),
    ...sectionEntries("Design system", "/design-system", designSystemSections),
    ...notes.map((note, position) => noteEntry(note, position)),
    ...experiments.map(experimentEntry),
    ...registryItems.map((item, position) => registryEntry(item, position)),
    ...channelEntries(),
  ];
});
