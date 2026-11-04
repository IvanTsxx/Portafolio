import { getNotes } from "@/lib/content/notes";
import { padCount, renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.notes);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = async () => {
  const notes = await getNotes();
  return renderOgImage({
    label: { code: "Writing", meta: `${padCount(notes.length)} entries` },
    summary:
      "Technical notes and breakdowns on rendering, motion and frontend craft.",
    title: { text: "Writing" },
  });
};

export default OpenGraphImage;
