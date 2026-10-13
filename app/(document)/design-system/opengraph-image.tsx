import { renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.designSystem);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: "Principles · Tokens · Layout · Motion",
    title: pageSeo.designSystem.title,
  });

export default OpenGraphImage;
