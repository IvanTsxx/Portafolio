// oxlint-disable no-promise-executor-return
// oxlint-disable promise/avoid-new
"use client";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import Link from "next/link";
import { Children, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { BOOKMARKS } from "@/shared/config/bookmarks";

const childrenExample = (
  <LoadMoreItemsWrapper max={3}>
    {BOOKMARKS.map((bookmark, i) => (
      <li className="list-none" key={bookmark.id}>
        <Link
          prefetch={false}
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center gap-3 py-2.5 transition-colors hover:text-brand-green ${
            i < BOOKMARKS.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <Bookmark
            className="h-[14px] w-[14px] shrink-0 text-muted-foreground transition-colors group-hover:text-brand-green"
            aria-hidden="true"
          />
          <span className="text-[13px] text-foreground transition-colors group-hover:text-brand-green">
            {bookmark.title}
          </span>
          <span className="text-[12px] text-muted-foreground">—</span>
          <span className="text-[12px] text-muted-foreground">
            {bookmark.author}
          </span>
          <ArrowUpRight
            className="ml-auto h-[14px] w-[14px] shrink-0 text-muted-foreground transition-colors group-hover:text-brand-green"
            aria-hidden="true"
          />
        </Link>
      </li>
    ))}
  </LoadMoreItemsWrapper>
);

interface LoadMoreItemsWrapperProps {
  children: React.ReactNode;
  max: number;
}

export function LoadMoreItemsWrapper({
  children = childrenExample,
  max,
}: LoadMoreItemsWrapperProps) {
  const [shown, setShown] = useState(max);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, {
    margin: "-20% 0px",
    once: false,
  });

  const items = Children.toArray(children);
  const visible = items.slice(0, shown);
  const hasMore = shown < items.length;

  async function handleLoadMore() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setShown((s) => Math.min(s + max, items.length));
    setLoading(false);
  }

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {visible.map((child, i) => (
          <motion.div
            key={(child as React.ReactElement).key ?? i}
            initial={{ opacity: 0, y: -12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
            transition={{
              delay: isInView ? i * 0.6 : 0,
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <Button
          disabled={loading}
          onClick={handleLoadMore}
          className="relative max-w-fit mx-auto"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.7,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
                Loading...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Load {Math.min(max, items.length - shown)} more
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      )}
    </div>
  );
}
