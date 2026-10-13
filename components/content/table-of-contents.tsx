"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const clickedId = useRef<string | null>(null);

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
        if (clickedId.current) {
          return;
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

    const releaseClick = () => {
      clickedId.current = null;
    };
    window.addEventListener("scrollend", releaseClick);

    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", releaseClick);
    };
  }, [headings]);

  useLayoutEffect(() => {
    const link = links.current.get(activeId);
    setMarker(
      link
        ? {
            x: link.offsetLeft,
            y: link.offsetTop + link.offsetHeight / 2,
          }
        : null
    );
  }, [activeId]);

  return (
    <nav aria-label="On this page" className={cn("relative", className)}>
      <span
        aria-hidden
        className="bg-ink ease-out-quart pointer-events-none absolute top-0 left-0 size-1.5 transition-[translate,opacity] duration-300 data-[hidden=true]:opacity-0"
        data-hidden={marker === null}
        style={{
          translate: `${marker?.x ?? 0}px calc(${marker?.y ?? 0}px - 50%)`,
        }}
      />
      <ol className="flex flex-col">
        {headings.map((heading) => (
          <li className={cn(heading.depth === 3 && "pl-4")} key={heading.id}>
            <a
              aria-current={activeId === heading.id ? "location" : undefined}
              className={cn(dotItemClassName, "before:invisible")}
              href={`#${heading.id}`}
              onClick={() => {
                clickedId.current = heading.id;
                setActiveId(heading.id);
              }}
              ref={(element) => {
                if (element) {
                  links.current.set(heading.id, element);
                } else {
                  links.current.delete(heading.id);
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
