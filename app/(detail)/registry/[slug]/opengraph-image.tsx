import { notFound } from "next/navigation";

import { renderOgImage } from "@/lib/content/og-image";
import {
  getRegistryItem,
  registryItems,
  toCategoryLabel,
} from "@/lib/registry/registry";

export const alt = "Registry component";
export { contentType, size } from "@/lib/content/og-image";

export const generateStaticParams = () =>
  registryItems.map((item) => ({ slug: item.name }));

const RegistryItemOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const item = getRegistryItem(slug);
  if (!item) {
    notFound();
  }
  return renderOgImage({
    eyebrow: `Registry · ${item.categories.map(toCategoryLabel).join(" / ")}`,
    title: item.title,
  });
};

export default RegistryItemOpenGraphImage;
