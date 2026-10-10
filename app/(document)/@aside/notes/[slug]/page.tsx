import { NoteAside } from "@/components/content/note-detail";
import { getNote, getNoteSlugs } from "@/lib/content/notes";

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const slugs = await getNoteSlugs();
  return slugs.map((slug) => ({ slug }));
};

const NoteDetailAside = async ({ params }: PageProps<"/notes/[slug]">) => {
  const { slug } = await params;
  const document = await getNote(slug);
  return document ? (
    <NoteAside headings={document.headings} note={document.entry} />
  ) : null;
};

export default NoteDetailAside;
