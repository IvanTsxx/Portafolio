import { renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.registry);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: "shadcn registry · Installable components",
    title: pageSeo.registry.title,
  });

export default OpenGraphImage;
