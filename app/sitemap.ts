import type { MetadataRoute } from "next";
import { getPosts } from "@/app/actions/posts";
import { getProjects } from "@/app/actions/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const projects = await getProjects({ limit: 100 });

  const postUrls = posts.map((post) => ({
    url: `https://ivantsx.dev/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const projectUrls = projects.map((project) => ({
    url: `https://ivantsx.dev/projects/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://ivantsx.dev",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://ivantsx.dev/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://ivantsx.dev/projects",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://ivantsx.dev/experience",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...postUrls,
    ...projectUrls,
  ];
}
