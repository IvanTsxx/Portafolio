import { renderOgImage } from "@/lib/content/og-image";
import { siteConfig } from "@/lib/site/config";

export { contentType, size } from "@/lib/content/og-image";
export { siteTitle as alt } from "@/lib/site/seo";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: `${siteConfig.role} · ${siteConfig.location}`,
    title: siteConfig.nickname,
  });

export default OpenGraphImage;
