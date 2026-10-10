"use client";

import { useEffect, useState } from "react";

import { focusRingClassName } from "@/components/site/styles";
import type { Heading } from "@/lib/content/text";
import { cn } from "@/lib/utils";

export const TableOfContents = ({
  className,
  headings,
}: {
  className?: string;
  headings: readonly Heading[];
}) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const visibleIds = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }
        const firstVisible = headings.find((heading) =>
          visibleIds.has(heading.id)
        );
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px" }
    );

    for (const heading of headings) {
      const element = document.querySelector(
        `[id="${CSS.escape(heading.id)}"]`
      );
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className={className}>
      <ol className="border-rule border-l">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              aria-current={activeId === heading.id ? "location" : undefined}
              className={cn(
                "text-graphite hover:text-ink aria-[current=location]:text-ink aria-[current=location]:border-ink ease-mechanical -ml-px flex min-h-11 items-center gap-3 border-l border-transparent py-2 pr-2 pl-4 text-sm transition-colors duration-100 md:min-h-0",
                focusRingClassName,
                heading.depth === 3 && "pl-8"
              )}
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
