"use client";

import { useId, useRef } from "react";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { ThumbIndex } from "@/registry/ivan/ui/thumb-index";

const sectionLabels = [
  "Intro",
  "Work",
  "Registry",
  "Lab",
  "Notes",
  "Contact",
] as const;

const SectionScroller = ({ count }: { count: number }) => {
  const scroller = useRef<HTMLDivElement>(null);
  const prefix = useId();
  const sections = sectionLabels.slice(0, count).map((label) => ({
    id: `${prefix}-${label.toLowerCase()}`,
    label,
  }));
  return (
    <div className="relative h-80 w-full">
      <div className="h-full overflow-y-auto pr-16" ref={scroller}>
        {sections.map((section) => (
          <section
            className="border-border flex h-56 items-start border-b p-6"
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

interface ThumbIndexValues {
  count: number;
}

const initialValues: ThumbIndexValues = { count: 5 };

const controls: readonly Control<keyof ThumbIndexValues>[] = [
  { key: "count", kind: "range", label: "Sections", max: 6, min: 2 },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => <SectionScroller count={values.count} key={values.count} />}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center p-4">
    <SectionScroller count={4} />
  </div>
);
