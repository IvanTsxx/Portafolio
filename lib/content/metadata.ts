import type { Metadata } from "next";

import { siteConfig } from "@/lib/site/config";

import type { BlogPost } from "./blog";
import type { WorkProject } from "./work";

export const isIndexable = (entry: { sample: boolean }) => !entry.sample;

export const absoluteUrl = (pathname: string) =>
  new URL(pathname, siteConfig.url).toString();

const robotsFor = (entry: { sample: boolean }): Metadata["robots"] =>
  isIndexable(entry) ? undefined : { follow: true, index: false };

export const buildWorkMetadata = (project: WorkProject): Metadata => {
  const pathname = `/work/${project.slug}`;
  return {
    alternates: { canonical: pathname },
    description: project.summary,
    openGraph: {
      description: project.summary,
      siteName: siteConfig.name,
      title: `${project.title} · ${siteConfig.shortName}`,
      type: "website",
      url: pathname,
    },
    robots: robotsFor(project),
    title: project.title,
  };
};

export const buildPostMetadata = (post: BlogPost): Metadata => {
  const pathname = `/blog/${post.slug}`;
  return {
    alternates: { canonical: pathname },
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    description: post.summary,
    keywords: post.tags,
    openGraph: {
      authors: [siteConfig.name],
      description: post.summary,
      publishedTime: `${post.date}T00:00:00.000Z`,
      siteName: siteConfig.name,
      tags: post.tags,
      title: post.title,
      type: "article",
      url: pathname,
    },
    robots: robotsFor(post),
    title: post.title,
  };
};

export const buildPostJsonLd = (post: BlogPost) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  author: {
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
  },
  datePublished: post.date,
  description: post.summary,
  headline: post.title,
  keywords: post.tags.join(", "),
  mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
});
