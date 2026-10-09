import path from "node:path";

import { createCollection } from "./collection";
import type { ContentEntry, MdxModule } from "./collection";
import { countFacets } from "./facets";
import { blogMetaSchema } from "./schema";
import type { BlogMeta } from "./schema";

export type BlogPost = ContentEntry<BlogMeta>;

export type PostIndexItem = Pick<
  BlogPost,
  | "date"
  | "readingTimeMinutes"
  | "sample"
  | "slug"
  | "summary"
  | "tags"
  | "title"
>;

export const toPostIndexItem = ({
  date,
  readingTimeMinutes,
  sample,
  slug,
  summary,
  tags,
  title,
}: BlogPost): PostIndexItem => ({
  date,
  readingTimeMinutes,
  sample,
  slug,
  summary,
  tags,
  title,
});

export interface BlogFilter {
  tag?: string;
}

export interface AdjacentPosts {
  newer: BlogPost | undefined;
  older: BlogPost | undefined;
}

export const comparePosts = (a: BlogPost, b: BlogPost) =>
  b.date.localeCompare(a.date) || a.title.localeCompare(b.title);

export const filterPosts = (
  posts: readonly BlogPost[],
  filter: BlogFilter = {}
) =>
  posts.filter(
    (post) => filter.tag === undefined || post.tags.includes(filter.tag)
  );

export interface RelatedPostsOptions {
  exclude?: readonly string[];
  limit?: number;
}

export const rankRelatedPosts = (
  posts: readonly BlogPost[],
  post: BlogPost,
  { exclude = [], limit = 2 }: RelatedPostsOptions = {}
) => {
  const excludedSlugs = new Set([post.slug, ...exclude]);
  const postTags = new Set(post.tags);
  const ranked: { candidate: BlogPost; shared: number }[] = [];

  for (const candidate of posts) {
    if (excludedSlugs.has(candidate.slug)) {
      continue;
    }
    const shared = candidate.tags.filter((tag) => postTags.has(tag)).length;
    if (shared > 0) {
      ranked.push({ candidate, shared });
    }
  }

  return ranked
    .toSorted(
      (a, b) => b.shared - a.shared || comparePosts(a.candidate, b.candidate)
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
};

export const findAdjacentPosts = (
  posts: readonly BlogPost[],
  slug: string
): AdjacentPosts => {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return { newer: undefined, older: undefined };
  }
  return { newer: posts[index - 1], older: posts[index + 1] };
};

const collection = createCollection<BlogMeta>({
  compare: comparePosts,
  directoryPath: path.join(process.cwd(), "content", "blog"),
  importModule: (slug): Promise<MdxModule> =>
    import(`@/content/blog/${slug}.mdx`),
  label: "content/blog",
  metaSchema: blogMetaSchema,
});

export const getPostSlugs = collection.slugs;

export const getPost = collection.getBySlug;

export const getPosts = async (filter: BlogFilter = {}) =>
  filterPosts(await collection.list(), filter);

export const getPostTags = async () => {
  const posts = await collection.list();
  return countFacets(posts.map((post) => post.tags));
};

export const getRelatedPosts = async (
  post: BlogPost,
  options?: RelatedPostsOptions
) => rankRelatedPosts(await collection.list(), post, options);

export const getAdjacentPosts = async (slug: string) =>
  findAdjacentPosts(await collection.list(), slug);
