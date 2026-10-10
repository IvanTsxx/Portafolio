"use client";

import { FilterBar } from "@/components/content/filter-bar";
import { PostRow } from "@/components/content/post-row";
import { useUrlFilter } from "@/components/content/use-url-filter";
import { PanelHeading } from "@/components/site/panel-heading";
import type { PostIndexItem } from "@/lib/content/blog";
import type { FacetCount } from "@/lib/content/facets";

const agentSpotLimit = 2;

const pad = (value: number) => String(value).padStart(2, "0");

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
    <section
      aria-label="Field notes index"
      className="mx-auto w-full max-w-screen-2xl px-4 pb-8 md:px-8"
    >
      <PanelHeading
        aside={`${pad(visiblePosts.length)} / ${pad(posts.length)}`}
        as="h2"
        index="FN-01"
        jp="一覧"
        label="Index"
      />
      <div className="py-6">
        <FilterBar
          active={tag}
          facets={tags}
          label="Tag"
          onChange={setTag}
          shown={visiblePosts.length}
          total={posts.length}
        />
      </div>
      <ul className="border-rule border-t">
        {visiblePosts.map((post) => (
          <PostRow
            key={post.slug}
            post={post}
            spot={posts.indexOf(post) < agentSpotLimit}
          />
        ))}
      </ul>
    </section>
  );
};
