import type { MetadataRoute } from "next";

import { SITE } from "@/shared/config/site";
import { getComponents } from "@/shared/lib/registry";
import { getAllThoughts } from "@/shared/lib/thoughts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE.url;

  const thoughts = await getAllThoughts();
  const components = await getComponents();

  // Group thoughts by slug (English and Spanish versions)
  const thoughtsBySlug = new Map<string, typeof thoughts>();
  for (const thought of thoughts) {
    const existing = thoughtsBySlug.get(thought.slug) || [];
    existing.push(thought);
    thoughtsBySlug.set(thought.slug, existing);
  }

  const thoughtEntries: MetadataRoute.Sitemap = [];

  // Add each post with language alternatives
  for (const [slug, langVersions] of thoughtsBySlug) {
    const enVersion = langVersions.find((t) => t.lang === "en");
    const esVersion = langVersions.find((t) => t.lang === "es");

    const alternatesLanguages: Record<string, string> = {};
    if (enVersion) alternatesLanguages["en"] = `${baseUrl}/thoughts/${slug}?lang=en`;
    if (esVersion) alternatesLanguages["es"] = `${baseUrl}/thoughts/${slug}?lang=es`;

    thoughtEntries.push({
      changeFrequency: "monthly" as const,
      lastModified: new Date(enVersion?.date || new Date().toISOString()),
      priority: 0.7,
      url: `${baseUrl}/thoughts/${slug}`,
      ...(Object.keys(alternatesLanguages).length > 0 && {
        alternates: {
          languages: alternatesLanguages,
        },
      }),
    });
  }

  const componentEntries: MetadataRoute.Sitemap = components.map(
    (component) => ({
      changeFrequency: "monthly" as const,
      priority: 0.6,
      url: `${baseUrl}/components/${component.name}`,
    })
  );

  return [
    {
      changeFrequency: "daily" as const,
      priority: 1,
      url: baseUrl,
    },
    {
      changeFrequency: "weekly" as const,
      priority: 0.8,
      url: `${baseUrl}/thoughts`,
      alternates: {
        languages: {
          en: `${baseUrl}/thoughts?lang=en`,
          es: `${baseUrl}/thoughts?lang=es`,
        },
      },
    },
    {
      changeFrequency: "monthly" as const,
      priority: 0.6,
      url: `${baseUrl}/components`,
    },
    ...thoughtEntries,
    ...componentEntries,
  ];
}
