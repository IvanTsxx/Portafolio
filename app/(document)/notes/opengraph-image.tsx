import { renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.notes);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: "Case studies · Field notes",
    title: pageSeo.notes.title,
  });

export default OpenGraphImage;
