import { NoteAside } from "@/components/content/note-detail";
import { getNote } from "@/lib/content/notes";

export const NotePanels = async ({ slug }: { slug: string }) => {
  const document = await getNote(slug);
  return document ? (
    <NoteAside headings={document.headings} note={document.entry} />
  ) : null;
};
