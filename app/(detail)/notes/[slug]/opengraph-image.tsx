import { notFound } from "next/navigation";

import { formatNoteCode, noteKinds } from "@/lib/content/note-domain";
import { getNote, getNoteSlugs, getNotes } from "@/lib/content/notes";
import { renderOgImage } from "@/lib/content/og-image";

export const alt = "Note";
export { contentType, size } from "@/lib/content/og-image";

export const generateStaticParams = () =>
  getNoteSlugs().map((slug) => ({ slug }));

const NoteOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const [document, notes] = await Promise.all([getNote(slug), getNotes()]);
  if (!document) {
    notFound();
  }
  const { entry: note } = document;
  const code = formatNoteCode(notes.findIndex((item) => item.slug === slug));
  return renderOgImage({
    label: { code, meta: noteKinds[note.kind].label },
    sample: note.sample,
    summary: note.summary,
    title: { text: note.title },
  });
};

export default NoteOpenGraphImage;
