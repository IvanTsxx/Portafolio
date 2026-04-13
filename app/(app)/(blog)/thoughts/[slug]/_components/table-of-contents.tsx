// oxlint-disable typescript/no-non-null-assertion
"use client";

import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const matches = content.matchAll(regex);

  for (const match of matches) {
    const level = match[1]!.length;
    const text = match[2]!.trim();
    const id = text
      .toLowerCase()
      .replaceAll(/[^a-z0-9\s-]/g, "")
      .replaceAll(/\s+/g, "-");

    headings.push({ id, level, text });
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);

    if (extracted.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    extracted.forEach(({ id }) => {
      const element = document.querySelector(`#${id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollY } = window;
      setIsVisible(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-12 left-0 right-0 z-30 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      {/* Backdrop - match navbar style */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm border-b border-border max-w-3xl mx-auto" />

      {/* Content - match navbar max-width */}
      <div className="relative max-w-3xl mx-auto px-4 h-12 flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-2 py-2",
            "hover:bg-secondary/50 rounded-md transition-colors",
            isOpen && "bg-secondary/30"
          )}
        >
          <div className="flex items-center gap-2">
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
              aria-hidden="true"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span className="text-sm font-medium">Jump to section</span>
          </div>

          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute left-0 right-0 bg-background border-b border-border max-w-3xl mx-auto",
          "transition-all duration-200 ease-out",
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto px-4 py-3">
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "py-2 px-3 text-sm rounded-md transition-colors text-left",
                  "hover:bg-secondary hover:text-foreground",
                  activeId === heading.id
                    ? "bg-brand-green/10 text-brand-green"
                    : "text-muted-foreground"
                )}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
