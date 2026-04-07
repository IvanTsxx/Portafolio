// oxlint-disable no-promise-executor-return
// oxlint-disable promise/avoid-new
"use client";
import { AnimatePresence, motion } from "motion/react";
import { Children, useState } from "react";

import { Button } from "@/shared/components/ui/button";

interface LoadMoreItemsWrapperProps {
  children: React.ReactNode;
  max: number;
}

export function LoadMoreItemsWrapper({
  children,
  max,
}: LoadMoreItemsWrapperProps) {
  const [shown, setShown] = useState(max);
  const [loading, setLoading] = useState(false);
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
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {visible.map((child, i) => (
          <motion.div
            key={(child as React.ReactElement).key ?? i}
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              delay: i >= shown - max ? (i - (shown - max)) * 0.06 : 0,
              duration: 0.2,
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
