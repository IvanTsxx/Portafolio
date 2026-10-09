"use client";

import { useEffect, useState } from "react";

import { homeSections } from "@/lib/home/sections";
import type { HomeSectionId } from "@/lib/home/sections";

export const SectionIndex = () => {
  const [activeId, setActiveId] = useState<HomeSectionId>(homeSections[0].id);

  useEffect(() => {
    const sectionByElement = new Map<Element, HomeSectionId>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = sectionByElement.get(entry.target);
          if (entry.isIntersecting && id) {
            setActiveId(id);
          }
        }
      },
      { rootMargin: "-45% 0px -54% 0px" }
    );
    for (const section of homeSections) {
      const element = document.querySelector(`#${section.id}`);
      if (element) {
        sectionByElement.set(element, section.id);
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections on this page"
      className="h-below-header sticky top-12 hidden flex-col justify-center lg:flex"
    >
      <ol className="flex flex-col">
        {homeSections.map((section) => (
          <li key={section.id}>
            <a
              aria-current={section.id === activeId ? "location" : undefined}
              className="group label text-faint hover:text-foreground aria-[current=location]:text-foreground flex h-11 items-center gap-2 transition-colors"
              href={`#${section.id}`}
            >
              <span
                aria-hidden
                className="bg-rule-strong group-aria-[current=location]:bg-clay ease-out-quart h-px w-2 transition-[width,background-color] duration-300 group-aria-[current=location]:w-4"
              />
              <span className="tabular-nums">{section.index}</span>
              <span className="sr-only">{section.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
