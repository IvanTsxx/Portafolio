import { renderOgImage } from "@/lib/content/og-image";
import { siteConfig } from "@/lib/site/config";

export { contentType, size } from "@/lib/content/og-image";
export { siteTitle as alt } from "@/lib/site/seo";

const { accent, closing, lead } = siteConfig.statement;

const OpenGraphImage = () =>
  renderOgImage({
    figure: { kind: "portrait" },
    label: { code: siteConfig.role, meta: siteConfig.location },
    title: { accent, signal: true, text: `${lead} ${accent}${closing}` },
  });

export default OpenGraphImage;
