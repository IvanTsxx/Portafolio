import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/content/blog";
import { absoluteUrl, isIndexable } from "@/lib/content/metadata";
import { getProjects } from "@/lib/content/work";
import { primaryRoutes } from "@/lib/site/config";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  return [
    ...primaryRoutes.map((route) => ({
      priority: route.href === "/" ? 1 : 0.8,
      url: absoluteUrl(route.href),
    })),
    ...projects.flatMap((project) =>
      isIndexable(project)
        ? [{ priority: 0.6, url: absoluteUrl(`/work/${project.slug}`) }]
        : []
    ),
    ...posts.flatMap((post) =>
      isIndexable(post)
        ? [
            {
              lastModified: post.date,
              priority: 0.6,
              url: absoluteUrl(`/blog/${post.slug}`),
            },
          ]
        : []
    ),
  ];
};

export default sitemap;
