import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { homeSection } from "@/lib/home/sections";
import type { HomeSectionId } from "@/lib/home/sections";
import { cn } from "@/lib/utils";

const cornerPlacements = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

export const CornerMarks = ({ className }: { className?: string }) => (
  <>
    {cornerPlacements.map((placement) => (
      <span
        aria-hidden
        className={cn(
          "border-rule-strong pointer-events-none absolute size-3",
          placement,
          className
        )}
        key={placement}
      />
    ))}
  </>
);

export const SampleTag = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "label border-rule-strong text-faint inline-flex h-5 items-center border px-1.5",
      className
    )}
    title="Sample content, not a real project"
  >
    Sample
  </span>
);

const statusDotVariants = cva("inline-block size-1.5 shrink-0 rounded-full", {
  defaultVariants: { tone: "clay" },
  variants: {
    tone: {
      clay: "bg-clay",
      faint: "bg-faint",
      moss: "bg-signal-moss",
      steel: "bg-signal-steel",
    },
  },
});

export const StatusDot = ({
  className,
  tone,
}: { className?: string } & VariantProps<typeof statusDotVariants>) => (
  <span aria-hidden className={cn(statusDotVariants({ tone }), className)} />
);

export const HomeSectionShell = ({
  id,
  className,
  children,
}: {
  id: HomeSectionId;
  className?: string;
  children: ReactNode;
}) => (
  <section
    aria-labelledby={`${id}-title`}
    className={cn("scroll-mt-12 px-4 md:px-6", className)}
    data-home-section={id}
    id={id}
  >
    {children}
  </section>
);

export const SectionHeading = ({
  id,
  title,
  lede,
  aside,
}: {
  id: HomeSectionId;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
}) => {
  const section = homeSection(id);
  return (
    <header className="border-rule grid gap-6 border-t pt-6 lg:grid-cols-12">
      <p className="label text-faint lg:col-span-3">
        <span className="text-clay">{section.index}</span>
        <span className="px-2">/</span>
        {section.label}
      </p>
      <div className="lg:col-span-6">
        <h2 className="display text-5xl md:text-6xl" id={`${id}-title`}>
          {title}
        </h2>
        {lede ? (
          <p className="text-muted-foreground mt-6 max-w-xl text-base text-pretty">
            {lede}
          </p>
        ) : null}
      </div>
      {aside ? (
        <div className="lg:col-span-3 lg:self-end lg:justify-self-end">
          {aside}
        </div>
      ) : null}
    </header>
  );
};
