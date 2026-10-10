import type { Metadata } from "next";

import { PostIndex } from "@/components/content/post-index";
import { PageHeader } from "@/components/site/page-header";
import { getPosts, getPostTags, toPostIndexItem } from "@/lib/content/blog";
import { siteConfig } from "@/lib/site/config";

const description = "Notes on parallel agents, worktrees, skills and MCPs.";

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
    <>
      <PageHeader
        code="FN-00"
        jp="野帳"
        lede="Notes on agents and the craft around them"
        meta={[
          { label: "Notes", value: String(posts.length).padStart(2, "0") },
        ]}
        title="Field notes"
      />
      <PostIndex posts={posts.map(toPostIndexItem)} tags={tags} />
    </>
  );
};

export default BlogPage;
