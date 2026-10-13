"use client";

import { useRef } from "react";

import { ThumbIndex } from "@/registry/ivan/ui/thumb-index";

const sections = [
  { id: "thumb-example-intro", label: "Intro" },
  { id: "thumb-example-work", label: "Work" },
  { id: "thumb-example-notes", label: "Notes" },
  { id: "thumb-example-contact", label: "Contact" },
];

export const Example = () => {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-80 w-full">
      <div className="h-full overflow-y-auto pr-16" ref={scroller}>
        {sections.map((section) => (
          <section
            className="flex h-64 items-start border-b p-6"
            id={section.id}
            key={section.id}
          >
            <h3 className="font-mono text-xs tracking-widest uppercase">
              {section.label}
            </h3>
          </section>
        ))}
      </div>
      <ThumbIndex
        className="absolute top-4 right-4 bottom-4"
        container={scroller}
        sections={sections}
      />
    </div>
  );
};
