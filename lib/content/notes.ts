import path from "node:path";

import { createCollection } from "./collection";
import type { MdxModule } from "./collection";
import {
  compareNotes,
  countNoteFacets,
  findAdjacentNotes,
  findRelationIssues,
  pickRelatedNotes,
} from "./note-domain";
import type { Note, RelatedNotesOptions } from "./note-domain";
import { noteMetaSchema } from "./schema";
import type { NoteMeta } from "./schema";

const collection = createCollection<NoteMeta>({
  compare: compareNotes,
  directoryPath: path.join(process.cwd(), "content", "notes"),
  findIssues: findRelationIssues,
  importModule: (slug): Promise<MdxModule> =>
    import(`@/content/notes/${slug}.mdx`),
  label: "content/notes",
  metaSchema: noteMetaSchema,
});

export const getNoteSlugs = collection.slugs;

export const getNote = collection.getBySlug;

export const getNotes = collection.list;

export const getNoteFacets = async () => countNoteFacets(await getNotes());

export const getRelatedNotes = async (
  note: Note,
  options?: RelatedNotesOptions
) => pickRelatedNotes(await getNotes(), note, options);

export const getAdjacentNotes = async (slug: string) =>
  findAdjacentNotes(await getNotes(), slug);
