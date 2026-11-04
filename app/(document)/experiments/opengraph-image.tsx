import { padCount, renderOgImage } from "@/lib/content/og-image";
import { experiments } from "@/lib/lab/experiments";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.experiments);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    label: { code: "Lab", meta: `${padCount(experiments.length)} experiments` },
    summary: "Interactive experiments in shaders, dithering and creative code.",
    title: { accent: "lab", text: "The lab" },
  });

export default OpenGraphImage;
