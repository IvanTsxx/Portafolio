import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostJsonLd } from "@/components/content/post-json-ld";
import { PostRow } from "@/components/content/post-row";
import { SampleBadge } from "@/components/content/sample-badge";
import { TableOfContents } from "@/components/content/table-of-contents";
import { CornerMarks } from "@/components/site/corner-marks";
import { PanelHeading } from "@/components/site/panel-heading";
import { chipClassName, focusRingClassName } from "@/components/site/styles";
import {
  getAdjacentPosts,
  getPost,
  getPosts,
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

const pad = (value: number) => String(value).padStart(2, "0");

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
        "group/marks border-rule-strong ease-mechanical hover:bg-paper-deep/60 relative flex min-h-11 flex-col gap-3 border p-5 transition-colors duration-100 md:p-6",
        focusRingClassName,
        !isNewer && "md:items-end md:text-right"
      )}
      href={`/blog/${post.slug}`}
    >
      <CornerMarks reveal="hover" />
      <span className="label text-mist group-hover/marks:text-ink flex items-center gap-2 transition-colors">
        {isNewer ? <ArrowLeft aria-hidden className="size-4" /> : null}
        {isNewer ? "Newer" : "Older"}
        {isNewer ? null : <ArrowRight aria-hidden className="size-4" />}
      </span>
      <span className="display text-ink text-2xl text-balance">
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
  const [posts, adjacent] = await Promise.all([
    getPosts(),
    getAdjacentPosts(post.slug),
  ]);
  const related = await getRelatedPosts(post, {
    exclude: [adjacent.newer?.slug, adjacent.older?.slug].filter(
      (adjacentSlug) => adjacentSlug !== undefined
    ),
  });
  const showTableOfContents =
    headings.length >= minimumHeadingsForTableOfContents;
  const code = `FN-${pad(posts.findIndex((item) => item.slug === post.slug) + 1)}`;

  return (
    <article className="mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-8 md:px-8 md:pt-8">
      {isIndexable(post) ? <PostJsonLd post={post} /> : null}
      <header>
        <div className="label border-rule-strong flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b pb-2">
          <Link
            className={cn(
              focusRingClassName,
              "text-ink hover:text-graphite inline-flex min-h-11 items-center gap-2 transition-colors md:min-h-8"
            )}
            href="/blog"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Field notes
          </Link>
          <span className="flex flex-wrap gap-x-6 gap-y-1">
            <span className="flex gap-2">
              <span className="text-mist">Doc</span>
              <span className="text-ink tabular-nums">{code}</span>
            </span>
            <time className="text-ink tabular-nums" dateTime={post.date}>
              {formatPostDate(post.date)}
            </time>
            <span className="text-ink tabular-nums">
              {pad(post.readingTimeMinutes)} min
            </span>
          </span>
        </div>
        <div className="mt-10 flex flex-col items-start gap-6 md:mt-16">
          <h1 className="display text-ink max-w-5xl text-5xl md:text-7xl">
            {post.title}
          </h1>
          <p className="text-graphite max-w-prose text-base text-pretty">
            {post.summary}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {post.sample ? (
              <SampleBadge source={`content/blog/${post.slug}.mdx`} />
            ) : null}
            <ul className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    className={chipClassName}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-x-8">
        {showTableOfContents ? (
          <aside className="lg:sticky lg:top-20 lg:col-span-3 lg:self-start">
            <details className="group/toc border-rule-strong mb-8 border lg:hidden">
              <summary
                className={cn(
                  "label text-graphite flex min-h-11 cursor-pointer items-center px-4 after:ml-auto after:content-['+'] group-open/toc:after:content-['−']",
                  focusRingClassName
                )}
              >
                On this page
              </summary>
              <TableOfContents className="px-4 pb-3" headings={headings} />
            </details>
            <div className="hidden lg:block">
              <p className="label text-mist mb-3">
                On this page <span className="jp ml-2">目次</span>
              </p>
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
        <section aria-labelledby="related-notes" className="mt-24">
          <PanelHeading
            aside={pad(related.length)}
            id="related-notes"
            index={`${code}.1`}
            jp="関連"
            label="Related notes"
          />
          <ul className="border-rule mt-6 border-t">
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
