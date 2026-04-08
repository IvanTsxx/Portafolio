import { formatDate } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icons } from "@/shared/components/icons";
import { Markdown } from "@/shared/components/markdown";
import { SITE } from "@/shared/config/site";
import { getCommentsBySlug } from "@/shared/lib/actions/comments";
import { getAllThoughts, getThoughtBySlug } from "@/shared/lib/thoughts";

import { CommentsSection } from "./_components/comments-section";
import { Reactions } from "./_components/reactions";

interface Props {
  params: Promise<{ slug: string }>;
}

// oxlint-disable-next-line require-await
export async function generateStaticParams() {
  return getAllThoughts().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const thought = getThoughtBySlug(slug);
  if (!thought) return {};
  return {
    description: thought.description,
    openGraph: {
      description: thought.description,

      publishedTime: thought.date,
      tags: thought.tags,
      title: thought.title,
      type: "article",
    },
    title: thought.title,
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function ThoughtPostPage({ params }: Props) {
  const { slug } = await params;
  const thought = getThoughtBySlug(slug);
  if (!thought) notFound();

  const { comments } = await getCommentsBySlug(slug);

  return (
    <div className="max-w-3xl bg-background/85 dark:bg-transparent mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        prefetch={false}
        href="/thoughts"
        className="  text-[12px] text-muted-foreground hover:text-brand-green transition-colors duration-150 mb-8 inline-block"
      >
        ← Thoughts
      </Link>

      {/* Post header */}
      <header className="grid grid-cols-1 gap-2">
        <h1 className="text-[28px] font-medium leading-tight mb-3 text-balance">
          {thought.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="  text-[12px] text-muted-foreground">
            {formatDate(thought.date, "MMM dd, yyyy")}
          </span>
          <span className="text-muted-foreground text-[12px]">·</span>
          <span className="  text-[12px] text-muted-foreground">
            {thought.readingTime} min read
          </span>
          {thought.tags.map((tag) => (
            <Link
              prefetch={false}
              key={tag}
              href={`/thoughts?tag=${tag}`}
              className="  text-[11px] border border-border px-1.5 py-0.5 text-muted-foreground hover:border-brand-green hover:text-brand-green transition-colors duration-150"
            >
              {tag}
            </Link>
          ))}
        </div>

        <Reactions slug={slug} />

        <hr className="border-border mt-4 pb-2" />
      </header>

      {/* MDX content */}
      <article className="my-12 prose w-full max-w-full prose-neutral dark:prose-invert">
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
    </div>
  );
}
