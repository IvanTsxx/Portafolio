import { renderOgImage } from "@/lib/content/og-image";
import { documentCode } from "@/lib/design-system/sections";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.designSystem);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    label: { code: documentCode, meta: "DESIGN.md" },
    summary: "What the site uses: color, type, layout, motion and components.",
    title: { text: pageSeo.designSystem.title },
  });

export default OpenGraphImage;
