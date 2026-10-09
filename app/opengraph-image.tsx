import { renderOgImage } from "@/lib/content/og-image";
import { siteConfig } from "@/lib/site/config";

export const alt = `${siteConfig.name} · Agent Workshop`;
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

const OpenGraphImage = () =>
  renderOgImage({
    eyebrow: `${siteConfig.role} · ${siteConfig.location}`,
    title: "Agent Workshop",
  });

export default OpenGraphImage;
