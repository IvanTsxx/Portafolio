import { renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.experiments);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: "Shaders · Motion · Type · CSS · 3D",
    title: pageSeo.experiments.title,
  });

export default OpenGraphImage;
