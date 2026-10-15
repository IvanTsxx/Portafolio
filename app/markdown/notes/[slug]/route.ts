import { isIndexable } from "@/lib/content/metadata";
import { notePath } from "@/lib/content/note-domain";
import { getNote, getNoteSlugs } from "@/lib/content/notes";
import { noteMarkdown } from "@/lib/markdown/documents";
import { markdownResponse } from "@/lib/markdown/response";

export const generateStaticParams = () =>
  getNoteSlugs().map((slug) => ({ slug }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/markdown/notes/[slug]">
) => {
  const { slug } = await params;
  const document = await getNote(slug);
  if (!document) {
    return new Response("Not found", { status: 404 });
  }
  return markdownResponse(noteMarkdown(document), {
    canonicalPath: notePath(slug),
    indexable: isIndexable(document.entry),
  });
};
