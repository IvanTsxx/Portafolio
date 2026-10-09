"use client";

import { FilterBar } from "@/components/content/filter-bar";
import { PostRow } from "@/components/content/post-row";
import { useUrlFilter } from "@/components/content/use-url-filter";
import type { PostIndexItem } from "@/lib/content/blog";
import type { FacetCount } from "@/lib/content/facets";

export const PostIndex = ({
  posts,
  tags,
}: {
  posts: readonly PostIndexItem[];
  tags: readonly FacetCount[];
}) => {
  const [requestedTag, setTag] = useUrlFilter("tag");
  const tag = tags.some((facet) => facet.name === requestedTag)
    ? requestedTag
    : "";
  const visiblePosts = tag
    ? posts.filter((post) => post.tags.includes(tag))
    : posts;

  return (
    <>
      <div className="px-4 pb-8 md:px-6">
        <FilterBar
          active={tag}
          facets={tags}
          label="Filter by tag"
          onChange={setTag}
          shown={visiblePosts.length}
          total={posts.length}
        />
      </div>
      <ul className="border-rule border-t">
        {visiblePosts.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </ul>
    </>
  );
};
