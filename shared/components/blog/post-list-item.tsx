"use client";

import { formatDate } from "date-fns";
import { EqualApproximately, Languages } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import type { Thought } from "@/shared/types/thought";

const LANG_FLAGS: Record<string, string> = {
  de: "🇩🇪",
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  it: "🇮🇹",
  ja: "🇯🇵",
  pt: "🇧🇷",
  zh: "🇨🇳",
};

interface PostListItemProps {
  thought: Thought;
  index: number;
}

export function PostListItem({ thought, index }: PostListItemProps) {
  // Show language badge always (at least the current lang)
  const langsToShow = thought.availableLangs?.length
    ? thought.availableLangs
    : [thought.lang].filter(Boolean);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: index * 0.04, duration: 0.18 }}
    >
      <Link
        prefetch={false}
        href={`/thoughts/${thought.slug}`}
        className={cn(
          "group flex items-baseline gap-4 py-3 border-b border-border",
          "hover:bg-secondary/40 px-1 -mx-1"
        )}
      >
        {/* Date — fixed width, Geist Mono */}
        <span className="  text-[12px] group-hover:text-brand-green transition-colors duration-150 text-muted-foreground shrink-0 w-[90px]">
          {formatDate(thought.date, "MMM dd, yyyy")}
        </span>

        {/* Title */}
        <span className="text-[14px] font-normal flex-1 min-w-0 truncate group-hover:text-brand-green transition-colors duration-150">
          {thought.title}
        </span>

        {/* Language badges - show always if langs available */}
        {langsToShow.length > 0 && (
          <span className="hidden md:flex items-center gap-1 shrink-0">
            <Languages
              size={12}
              className="text-muted-foreground group-hover:text-brand-green transition-colors duration-150"
            />
            {langsToShow.map((lang) => (
              <span
                key={lang}
                className="text-[10px] text-muted-foreground group-hover:text-brand-green transition-colors duration-150"
                title={lang.toUpperCase()}
              >
                {LANG_FLAGS[lang] || lang.toUpperCase()}
              </span>
            ))}
          </span>
        )}

        {/* Tags */}
        <span className="hidden sm:flex items-center gap-1 shrink-0">
          {thought.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="  group-hover:text-brand-green transition-colors duration-150 text-[11px] text-muted-foreground border border-border px-1.5 py-0.5 leading-none"
            >
              {tag}
            </span>
          ))}
        </span>

        {/* Reading time */}
        <span className="  group-hover:text-brand-green transition-colors duration-150 text-[12px] text-muted-foreground shrink-0 flex items-center gap-1">
          {/* aprox icon */}
          <EqualApproximately size={12} />
          {thought.readingTime}&nbsp;min
        </span>
      </Link>
    </motion.div>
  );
}
