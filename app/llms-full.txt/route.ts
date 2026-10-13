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

export const dynamic = "force-static";

const indexableNoteMarkdown = async () => {
  const allNotes = await getNotes();
  const notes = allNotes.filter(isIndexable);
  const documents = await Promise.all(notes.map((note) => getNote(note.slug)));
  return documents.flatMap((document) =>
    document ? [noteMarkdown(document)] : []
  );
};

export const GET = async () => {
  const [notes, registry] = await Promise.all([
    indexableNoteMarkdown(),
    Promise.all(registryItems.map(registryItemMarkdown)),
  ]);
  return plainTextResponse(
    buildLlmsFullTxt([
      ...notes,
      ...experiments.map(experimentMarkdown),
      ...registry,
    ])
  );
};
