import type { Metadata } from "next";

import { PostIndex } from "@/components/content/post-index";
import { getPosts, getPostTags, toPostIndexItem } from "@/lib/content/blog";
import { siteConfig } from "@/lib/site/config";

const description =
  "Field notes on running parallel AI agents, worktrees, skills, MCPs and the frontend craft around them. Written by the person who reviews and owns the result.";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  description,
  openGraph: {
    description,
    siteName: siteConfig.name,
    title: `Field notes · ${siteConfig.shortName}`,
    type: "website",
    url: "/blog",
  },
  title: "Field notes",
};

const BlogPage = async () => {
  const [posts, tags] = await Promise.all([getPosts(), getPostTags()]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl pb-24">
      <header className="blueprint-grid border-rule mask-b-from-70% px-4 pt-16 pb-12 md:px-6 md:pt-24 md:pb-16">
        <h1 className="display text-7xl md:text-8xl">Field notes</h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">
          {description}
        </p>
        <p className="label text-muted-foreground mt-8 tabular-nums">
          {posts.length} notes
        </p>
      </header>
      <PostIndex posts={posts.map(toPostIndexItem)} tags={tags} />
    </div>
  );
};

export default BlogPage;
