"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

export type ShimmeringTextProps = Omit<
  React.ComponentProps<typeof motion.span>,
  "children"
> & {
  text: string;
  duration?: number;
  isStopped?: boolean;
};

export function ShimmeringText({
  text,
  duration = 1,
  isStopped = false,
  className,
  ...props
}: ShimmeringTextProps) {
  // 👉 Agrupa palabra + puntuación + espacios correctamente
  const parts = React.useMemo(
    () => text.match(/[\w.]+[.,!?]?|\s+/g) ?? [],
    [text]
  );

  const effectiveLength = Math.min(parts.length, 20);

  const createVariants = React.useCallback(
    (index: number): Variants => ({
      running: {
        color: ["var(--color)", "var(--shimmering-color)", "var(--color)"],
        transition: {
          delay: (index * duration) / effectiveLength,
          duration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: parts.length * 0.05,
          repeatType: "loop" as const,
        },
      },
      stopped: {
        color: "var(--color)",
        transition: {
          duration: duration * 0.5,
          ease: "easeOut",
        },
      },
    }),
    [duration, effectiveLength, parts.length]
  );

  return (
    <motion.span
      className={cn(
        "inline-flex flex-wrap wrap-break-word",
        "[--color:var(--muted-foreground)] [--shimmering-color:var(--foreground)]",
        className
      )}
      {...props}
    >
      {parts.map((part, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial="stopped"
          animate={isStopped ? "stopped" : "running"}
          variants={createVariants(i)}
        >
          {part}
        </motion.span>
      ))}
    </motion.span>
  );
}
