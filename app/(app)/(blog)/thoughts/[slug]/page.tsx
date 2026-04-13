import { formatDate } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RelatedThoughts } from "@/shared/components/blog/related-thoughts";
import { Icons } from "@/shared/components/icons";
import {
  BreadcrumbJsonLd,
  BlogPostingJsonLd,
} from "@/shared/components/json-ld";
import { Markdown } from "@/shared/components/markdown";
import { SITE } from "@/shared/config/site";
import { getCommentsBySlug } from "@/shared/lib/data";
import {
  getAllThoughts,
  getThoughtBySlug,
  getRelatedThoughts,
} from "@/shared/lib/thoughts";

import { CommentsSection } from "./_components/comments-section";
import { LanguageSwitcherWrapper } from "./_components/language-switcher-wrapper";
import { Reactions } from "./_components/reactions";
import { ReadingProgress } from "./_components/reading-progress";
import { TableOfContents } from "./_components/table-of-contents";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const thoughts = await getAllThoughts();
  // Generate params for each unique slug (not per language)
  const uniqueSlugs = [...new Set(thoughts.map((t) => t.slug))];
  return uniqueSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const thought = await getThoughtBySlug(slug, "en");
  if (!thought) return {};
  return {
    alternates: {
      canonical: `/thoughts/${slug}`,
    },
    description: thought.description,
    openGraph: {
      description: thought.description,
      publishedTime: thought.date,
      siteName: SITE.name,
      tags: thought.tags,
      title: thought.title,
      type: "article",
      url: `${SITE.url}/thoughts/${slug}`,
    },
    title: thought.title,
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function ThoughtPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const thought = await getThoughtBySlug(slug, lang);
  if (!thought) notFound();

  const [{ comments }, relatedThoughts] = await Promise.all([
    getCommentsBySlug(slug),
    getRelatedThoughts(slug),
  ]);

  return (
    <>
      <ReadingProgress />
      <TableOfContents content={thought.content} />
      <div className="py-10 w-full max-w-3xl mx-auto">
        <BlogPostingJsonLd
          date={thought.date}
          description={thought.description}
          slug={slug}
          title={thought.title}
        />
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: SITE.url },
            { name: "Thoughts", url: `${SITE.url}/thoughts` },
            { name: thought.title, url: `${SITE.url}/thoughts/${slug}` },
          ]}
        />
        {/* Back link */}
        <Link
          prefetch={false}
          href="/thoughts"
          className="text-[12px] text-muted-foreground hover:text-brand-green transition-colors duration-150 mb-8 inline-block"
        >
          ← Thoughts
        </Link>

        {/* Language switcher - above title */}
        <div className="mb-4">
          <LanguageSwitcherWrapper
            currentLang={thought.lang}
            availableLangs={thought.availableLangs}
            slug={slug}
          />
        </div>

        {/* Post header */}
        <header className="grid grid-cols-1 gap-2">
          <h1 className="text-[28px] font-medium leading-tight mb-3 text-balance">
            {thought.title}
          </h1>
          <p className="text-[16px] text-muted-foreground mb-4">
            {thought.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-[12px] text-muted-foreground">
              {formatDate(thought.date, "MMM dd, yyyy")}
            </span>
            <span className="text-muted-foreground text-[12px]">·</span>
            <span className="text-[12px] text-muted-foreground">
              {thought.readingTime} min read
            </span>
            {thought.tags.map((tag) => (
              <Link
                prefetch={false}
                key={tag}
                href={`/thoughts?tag=${tag}`}
                className="text-[11px] border border-border px-1.5 py-0.5 text-muted-foreground hover:border-brand-green hover:text-brand-green transition-colors duration-150"
              >
                {tag}
              </Link>
              ))}
          </div>

          <Reactions slug={slug} />

          <hr className="border-border mt-4 pb-2" />
        </header>

        {/* MDX content */}
        <article
          className="my-12 prose w-full max-w-full prose-neutral dark:prose-invert
          prose-pre:overflow-x-auto
          prose-pre:max-w-full
          prose-code:wrap-break-word"
        >
          <Markdown content={thought.content} />
        </article>

        {/* Post footer */}
        <div className="border-t border-border pt-6 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-[13px] text-muted-foreground">
              Written by{" "}
              <span className="text-foreground font-medium">
                Ivan Bongiovanni
              </span>
            </span>
            <div className="flex items-center gap-3">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-green transition-colors duration-150"
                aria-label="GitHub"
              >
                <Icons.Github className="size-6" strokeWidth={1.5} />
              </a>
              <a
                href={SITE.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-green transition-colors duration-150"
                aria-label="Twitter"
              >
                <Icons.Twitter className="size-6" strokeWidth={1.5} />
              </a>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-green transition-colors duration-150"
                aria-label="Twitter"
              >
                <Icons.Linkedin className="size-6" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentsSection slug={slug} initialComments={comments} />

        {/* Related thoughts */}
        <RelatedThoughts thoughts={relatedThoughts} />
      </div>
    </>
  );
}
