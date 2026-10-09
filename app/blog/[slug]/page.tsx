import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostJsonLd } from "@/components/content/post-json-ld";
import { PostRow } from "@/components/content/post-row";
import { SampleBadge } from "@/components/content/sample-badge";
import { TableOfContents } from "@/components/content/table-of-contents";
import {
  getAdjacentPosts,
  getPost,
  getPostSlugs,
  getRelatedPosts,
  toPostIndexItem,
} from "@/lib/content/blog";
import type { BlogPost } from "@/lib/content/blog";
import { formatPostDate } from "@/lib/content/format";
import { buildPostMetadata, isIndexable } from "@/lib/content/metadata";
import { cn } from "@/lib/utils";

const minimumHeadingsForTableOfContents = 3;

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const document = await getPost(slug);
  return document ? buildPostMetadata(document.entry) : {};
};

const AdjacentLink = ({
  direction,
  post,
}: {
  direction: "newer" | "older";
  post: BlogPost | undefined;
}) => {
  if (!post) {
    return <div />;
  }
  const isNewer = direction === "newer";
  return (
    <Link
      className={cn(
        "group border-rule hover:bg-card flex min-h-11 flex-col gap-3 border p-5 transition-colors md:p-6",
        !isNewer && "md:items-end md:text-right"
      )}
      href={`/blog/${post.slug}`}
    >
      <span className="label text-muted-foreground group-hover:text-clay flex items-center gap-2 transition-colors">
        {isNewer ? <ArrowLeft aria-hidden className="size-4" /> : null}
        {isNewer ? "Newer" : "Older"}
        {isNewer ? null : <ArrowRight aria-hidden className="size-4" />}
      </span>
      <span className="display text-foreground text-2xl text-balance">
        {post.title}
      </span>
    </Link>
  );
};

const BlogPostPage = async ({ params }: PageProps<"/blog/[slug]">) => {
  const { slug } = await params;
  const document = await getPost(slug);
  if (!document) {
    notFound();
  }

  const { Content, entry: post, headings } = document;
  const adjacent = await getAdjacentPosts(post.slug);
  const related = await getRelatedPosts(post, {
    exclude: [adjacent.newer?.slug, adjacent.older?.slug].filter(
      (adjacentSlug) => adjacentSlug !== undefined
    ),
  });
  const showTableOfContents =
    headings.length >= minimumHeadingsForTableOfContents;

  return (
    <article className="mx-auto w-full max-w-screen-2xl px-4 pt-10 pb-24 md:px-6 md:pt-14">
      {isIndexable(post) ? <PostJsonLd post={post} /> : null}
      <header>
        <Link
          className="label text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-2 transition-colors"
          href="/blog"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Field notes
        </Link>
        <div className="mt-6 flex flex-col items-start gap-6">
          <p className="label text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
            <time className="tabular-nums" dateTime={post.date}>
              {formatPostDate(post.date)}
            </time>
            <span className="tabular-nums">
              {post.readingTimeMinutes} min read
            </span>
            {post.sample ? (
              <SampleBadge source={`content/blog/${post.slug}.mdx`} />
            ) : null}
          </p>
          <h1 className="display max-w-5xl text-5xl md:text-7xl">
            {post.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-xl text-pretty">
            {post.summary}
          </p>
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  className="label border-rule-strong text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex min-h-11 items-center rounded-sm border px-3 transition-colors md:min-h-8"
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="border-rule mt-12 border-t pt-12 lg:grid lg:grid-cols-12 lg:gap-x-8">
        {showTableOfContents ? (
          <aside className="lg:sticky lg:top-24 lg:col-span-3 lg:self-start">
            <details className="border-rule mb-8 border lg:hidden">
              <summary className="label text-muted-foreground flex min-h-11 cursor-pointer items-center px-4">
                On this page
              </summary>
              <TableOfContents className="px-4 pb-3" headings={headings} />
            </details>
            <div className="hidden lg:block">
              <p className="label text-muted-foreground mb-3">On this page</p>
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}
        <div
          className={cn(
            "min-w-0 lg:col-span-7 [&_img]:h-auto [&_img]:max-w-full",
            showTableOfContents ? "lg:col-start-5" : "lg:col-start-3"
          )}
        >
          <Content />
        </div>
      </div>

      {adjacent.newer || adjacent.older ? (
        <nav
          aria-label="More field notes"
          className="mt-24 grid gap-4 md:grid-cols-2"
        >
          <AdjacentLink direction="newer" post={adjacent.newer} />
          <AdjacentLink direction="older" post={adjacent.older} />
        </nav>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-24">
          <h2 className="display border-rule border-t pt-6 pb-8 text-4xl">
            Related notes
          </h2>
          <ul className="border-rule border-t">
            {related.map((item) => (
              <PostRow
                density="compact"
                key={item.slug}
                post={toPostIndexItem(item)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
};

export default BlogPostPage;
