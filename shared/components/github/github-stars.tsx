"use client";
import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import { Icons } from "../icons";

export interface GitHubStarsProps {
  /** GitHub repository in `owner/repo` format. */
  repo: string;
  /** Number of stars to display. */
  stargazersCount: number;
  /**
   * Optional locales for number formatting.
   * See [MDN - Intl - locales argument](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
   * @defaultValue "en-US"
   */
  locales?: Intl.LocalesArgument;
}

export function GitHubStars({
  repo,
  stargazersCount,
  locales = "en-US",
}: GitHubStarsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 6 * 0.1, duration: 0.5 }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              render={
                <Link
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noopener"
                  prefetch={false}
                />
              }
              nativeButton={false}
            />
          }
        >
          <Icons.Github className="size-5" />
          <span className=" tabular-nums">
            {new Intl.NumberFormat(locales, {
              compactDisplay: "short",
              notation: "compact",
            })
              .format(stargazersCount)
              .toLowerCase()}
          </span>
        </TooltipTrigger>

        <TooltipContent>
          {new Intl.NumberFormat(locales).format(stargazersCount)} stars
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
