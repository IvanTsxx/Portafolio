import type { MetadataRoute } from "next";

import { SITE } from "@/shared/config/site";
import { getComponents } from "@/shared/lib/registry";
import { getAllThoughts } from "@/shared/lib/thoughts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE.url;

  const thoughts = await getAllThoughts();
  const components = await getComponents();

  const thoughtEntries: MetadataRoute.Sitemap = thoughts.map((thought) => ({
    changeFrequency: "monthly",
    lastModified: new Date(thought.date),
    priority: 0.7,
    url: `${baseUrl}/thoughts/${thought.slug}`,
  }));

  const componentEntries: MetadataRoute.Sitemap = components.map(
    (component) => ({
      changeFrequency: "monthly",
      priority: 0.6,
      url: `${baseUrl}/components/${component.name}`,
    })
  );

  return [
    {
      changeFrequency: "daily",
      priority: 1,
      url: baseUrl,
    },
    {
      changeFrequency: "weekly",
      priority: 0.8,
      url: `${baseUrl}/thoughts`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.6,
      url: `${baseUrl}/components`,
    },
    ...thoughtEntries,
    ...componentEntries,
  ];
}
