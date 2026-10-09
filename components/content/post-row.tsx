import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";

import { SampleBadge } from "@/components/content/sample-badge";
import type { PostIndexItem } from "@/lib/content/blog";
import { formatPostDate } from "@/lib/content/format";

const postTitleVariants = cva("display text-foreground text-balance", {
  defaultVariants: { density: "roomy" },
  variants: {
    density: {
      compact: "text-3xl",
      roomy: "text-4xl lg:text-5xl",
    },
  },
});

export const PostRow = ({
  density,
  post,
}: { post: PostIndexItem } & VariantProps<typeof postTitleVariants>) => (
  <li className="group border-rule hover:bg-card has-[a:focus-visible]:outline-clay relative border-b transition-colors has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2">
    <div className="grid gap-x-4 gap-y-4 px-4 py-6 md:px-6 lg:grid-cols-12">
      <div className="label text-muted-foreground group-hover:text-clay flex flex-wrap items-center gap-x-4 gap-y-1 transition-colors lg:col-span-2 lg:flex-col lg:items-start">
        <time className="tabular-nums" dateTime={post.date}>
          {formatPostDate(post.date)}
        </time>
        <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
      </div>
      <div className="flex flex-col gap-3 lg:col-span-7">
        <h2 className={postTitleVariants({ density })}>
          <Link
            className="flex items-start justify-between gap-4 outline-none after:absolute after:inset-0"
            href={`/blog/${post.slug}`}
          >
            <span>{post.title}</span>
            <ArrowUpRight
              aria-hidden
              className="text-clay ease-out-quart mt-1 hidden size-6 shrink-0 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-has-[a:focus-visible]:translate-x-0 group-has-[a:focus-visible]:opacity-100 lg:block"
            />
          </Link>
        </h2>
        <p className="text-muted-foreground max-w-prose text-base/7 text-pretty">
          {post.summary}
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:items-end">
        <ul className="label text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 lg:justify-end">
          {post.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        {post.sample ? (
          <SampleBadge source={`content/blog/${post.slug}.mdx`} />
        ) : null}
      </div>
    </div>
  </li>
);
