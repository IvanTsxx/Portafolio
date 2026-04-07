"use client";

import { AnimatePresence } from "motion/react";
import { useQueryState } from "nuqs";

import { PostListItem } from "@/shared/components/blog/post-list-item";
import { cn } from "@/shared/lib/utils";
import type { Thought } from "@/shared/types/thought";

interface ThoughtsFilterProps {
  thoughts: Thought[];
  allTags: string[];
}

export function ThoughtsFilter({ thoughts, allTags }: ThoughtsFilterProps) {
  const [q, setQ] = useQueryState("q", { defaultValue: "", shallow: true });
  const [activeTag, setActiveTag] = useQueryState("tag", {
    defaultValue: "",
    shallow: true,
  });

  const filtered = thoughts.filter((t) => {
    const query = q.toLowerCase().trim();
    const matchesQ =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query);
    const matchesTag = !activeTag || t.tags.includes(activeTag);
    return matchesQ && matchesTag;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value || null)}
        placeholder="Search thoughts..."
        className={cn(
          "w-full h-9 px-3 text-sm font-sans bg-background text-foreground",
          "border border-border outline-none",
          "placeholder:text-muted-foreground",
          "focus:border-brand-green transition-colors duration-150"
        )}
        aria-label="Search thoughts"
      />

      {/* Tag pills */}
      {allTags.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by tag"
        >
          {allTags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                className={cn(
                  "  text-[11px] px-2 py-1 border transition-colors duration-150 leading-none",
                  isActive
                    ? "border-brand-green text-brand-green"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
                aria-pressed={isActive}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Post list */}
      <div>
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((thought, i) => (
              <PostListItem key={thought.slug} thought={thought} index={i} />
            ))
          ) : (
            <p className="  text-[13px] text-muted-foreground text-center py-12">
              No thoughts found. Try a different search.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
