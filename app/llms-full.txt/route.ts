import { isIndexable } from "@/lib/content/metadata";
import { getNote, getNotes } from "@/lib/content/notes";
import { experiments } from "@/lib/lab/experiments";
import {
  experimentMarkdown,
  noteMarkdown,
  registryItemMarkdown,
} from "@/lib/markdown/documents";
import { buildLlmsFullTxt } from "@/lib/markdown/llms";
import { plainTextResponse } from "@/lib/markdown/response";
import { registryItems } from "@/lib/registry/registry";

const indexableNoteMarkdown = async () => {
  const allNotes = await getNotes();
  const notes = allNotes.filter(isIndexable);
  const documents = await Promise.all(notes.map((note) => getNote(note.slug)));
  return documents.flatMap((document) =>
    document ? [noteMarkdown(document)] : []
  );
};

export const GET = async () => {
  const notes = await indexableNoteMarkdown();
  return plainTextResponse(
    buildLlmsFullTxt([
      ...notes,
      ...experiments.map(experimentMarkdown),
      ...registryItems.map(registryItemMarkdown),
    ])
  );
};
