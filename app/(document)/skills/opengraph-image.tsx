import { renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.skills);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: "Agent Skills · npx skills add",
    title: pageSeo.skills.title,
  });

export default OpenGraphImage;
