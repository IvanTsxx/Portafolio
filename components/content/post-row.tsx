import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";

import { SampleBadge } from "@/components/content/sample-badge";
import { CornerMarks } from "@/components/site/corner-marks";
import { hoverRowClassName } from "@/components/site/styles";
import type { PostIndexItem } from "@/lib/content/blog";
import { formatPostDate } from "@/lib/content/format";
import { cn } from "@/lib/utils";

const postTitleVariants = cva("display text-ink text-balance", {
  defaultVariants: { density: "roomy" },
  variants: {
    density: {
      compact: "text-2xl",
      roomy: "text-3xl lg:text-4xl",
    },
  },
});

export const PostRow = ({
  density,
  post,
}: {
  post: PostIndexItem;
} & VariantProps<typeof postTitleVariants>) => (
  <li
    className={cn(
      "group/marks border-rule relative border-b",
      hoverRowClassName
    )}
  >
    <CornerMarks reveal="hover" />
    <div className="grid gap-x-4 gap-y-4 p-4 md:p-5 lg:grid-cols-12">
      <div className="label text-mist flex flex-wrap items-center gap-x-4 gap-y-1 lg:col-span-2 lg:flex-col lg:items-start">
        <time className="tabular-nums" dateTime={post.date}>
          {formatPostDate(post.date)}
        </time>
        <span className="tabular-nums">
          {String(post.readingTimeMinutes).padStart(2, "0")} min
        </span>
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
              className="text-ink ease-out-quart mt-1 hidden size-6 shrink-0 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-focus-within/marks:translate-x-0 group-focus-within/marks:opacity-100 group-hover/marks:translate-x-0 group-hover/marks:opacity-100 lg:block"
            />
          </Link>
        </h2>
        <p className="text-graphite max-w-prose text-sm text-pretty">
          {post.summary}
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:items-end">
        <ul className="flex flex-wrap gap-2 lg:justify-end">
          {post.tags.map((tag) => (
            <li
              className="label border-rule-strong text-graphite border px-2 py-1"
              key={tag}
            >
              {tag}
            </li>
          ))}
        </ul>
        {post.sample ? (
          <SampleBadge source={`content/blog/${post.slug}.mdx`} />
        ) : null}
      </div>
    </div>
  </li>
);
