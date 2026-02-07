"use server";

import { prisma } from "@/lib/prisma";
import type { SearchResult } from "@/lib/types";

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();

  // Search posts
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: {
      tags: true,
      category: true,
    },
    take: 5,
  });

  // Search projects
  const projects = await prisma.project.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: {
      technologies: true,
    },
    take: 5,
  });

  const results: SearchResult[] = [];

  // Add post results
  for (const post of posts) {
    const titleMatch = post.title.toLowerCase().includes(searchTerm);
    const descMatch = post.description?.toLowerCase().includes(searchTerm);
    const categoryMatch = post.category?.name
      .toLowerCase()
      .includes(searchTerm);
    const tagMatch = post.tags.some((tag) =>
      tag.name.toLowerCase().includes(searchTerm),
    );

    results.push({
      id: post.id,
      type: "post",
      title: post.title,
      description: post.description,
      slug: post.slug,
      tags: post.tags.map((t) => t.name),
      category: post.category?.name,
      matchType: titleMatch
        ? "title"
        : descMatch
          ? "description"
          : categoryMatch
            ? "category"
            : tagMatch
              ? "tag"
              : "title",
    });
  }

  // Add project results
  for (const project of projects) {
    const titleMatch = project.title.toLowerCase().includes(searchTerm);
    const descMatch = project.description?.toLowerCase().includes(searchTerm);
    const techMatch = project.technologies.some((tech) =>
      tech.name.toLowerCase().includes(searchTerm),
    );

    results.push({
      id: project.id,
      type: "project",
      title: project.title,
      description: project.description,
      slug: project.slug,
      technologies: project.technologies.map((t) => t.name),
      matchType: titleMatch
        ? "title"
        : descMatch
          ? "description"
          : techMatch
            ? "technology"
            : "title",
    });
  }

  return results;
}
