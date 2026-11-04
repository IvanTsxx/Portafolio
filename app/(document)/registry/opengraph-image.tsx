import { padCount, renderOgImage } from "@/lib/content/og-image";
import { registryItems } from "@/lib/registry/registry";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";

export const alt = socialTitleOf(pageSeo.registry);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    label: {
      code: "Registry",
      meta: `${padCount(registryItems.length)} components`,
    },
    summary:
      "Installable shadcn components, from a magnetic button to WebGPU slime.",
    title: { accent: "registry", text: "The registry" },
  });

export default OpenGraphImage;
