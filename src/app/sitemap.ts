import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const url = "https://ivantsx.vercel.app";

  return [
    {
      url: `${url}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${url}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${url}/llms-full.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...source
      .getPages()
      .filter((page) => page.url !== "/")
      .map((page) => ({
        url: `${url}${page.url}`,
        lastModified: page.data.lastModified
          ? new Date(page.data.lastModified)
          : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
