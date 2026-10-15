"use client";

import { useId, useRef } from "react";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { cn } from "@/lib/utils";
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

const thumbnailSections = sectionLabels.slice(0, 4);
const thumbnailActive = 1;

const notchNumber = (index: number) => String(index + 1).padStart(2, "0");

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center p-4">
    <div className="relative h-full w-full">
      <div className="h-full overflow-hidden pr-16">
        {thumbnailSections.map((label) => (
          <div
            className="border-border flex h-14 items-start border-b p-3"
            key={label}
          >
            <span className="font-mono text-xs tracking-widest uppercase">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute inset-y-2 right-2 flex w-12 flex-col justify-between">
        <span className="bg-border absolute inset-y-0 right-0 w-px" />
        <span className="bg-foreground absolute top-0 right-0 h-1/3 w-px" />
        {thumbnailSections.map((label, index) => (
          <span
            className="relative -right-px flex h-8 items-center justify-end gap-2"
            key={label}
          >
            <span
              className={cn(
                "font-mono text-xs tabular-nums",
                index === thumbnailActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {notchNumber(index)}
            </span>
            <span
              className={cn(
                "h-7 w-2.5 border-y border-l",
                index === thumbnailActive
                  ? "border-foreground bg-foreground"
                  : "border-border bg-muted"
              )}
            />
          </span>
        ))}
      </div>
    </div>
  </div>
);
