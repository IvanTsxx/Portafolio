import { notFound } from "next/navigation";

import { noteKinds, stampOf } from "@/lib/content/note-domain";
import { getNote, getNoteSlugs } from "@/lib/content/notes";
import { renderOgImage } from "@/lib/content/og-image";

export const alt = "Note";
export { contentType, size } from "@/lib/content/og-image";

export const generateStaticParams = async () => {
  const slugs = await getNoteSlugs();
  return slugs.map((slug) => ({ slug }));
};

const NoteOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const document = await getNote(slug);
  if (!document) {
    notFound();
  }
  const { entry: note } = document;
  const detail =
    note.kind === "case-study"
      ? note.role
      : `${note.readingTimeMinutes} min read`;
  return renderOgImage({
    eyebrow: `${noteKinds[note.kind].label} · ${stampOf(note).label} · ${detail}`,
    sample: note.sample,
    title: note.title,
  });
};

export default NoteOpenGraphImage;
