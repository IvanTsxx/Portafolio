"use client";

import { useEffect, useState } from "react";

import { dotItemClassName } from "@/components/site/styles";
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
      <ol className="flex flex-col">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              aria-current={activeId === heading.id ? "location" : undefined}
              className={cn(dotItemClassName, heading.depth === 3 && "pl-4")}
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
