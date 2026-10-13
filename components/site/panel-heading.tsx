import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "p";

export const PanelHeading = ({
  aside,
  as: Tag = "h2",
  className,
  id,
  index,
  label,
}: {
  aside?: ReactNode;
  as?: HeadingTag;
  className?: string;
  id?: string;
  index: string;
  label: string;
}) =>
  label.trim() === "" ? null : (
    <div
      className={cn(
        "label border-rule-strong flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b pb-2",
        className
      )}
    >
      <Tag
        className="text-ink m-0 flex shrink-0 items-baseline gap-x-3 font-normal"
        id={id}
      >
        <span aria-hidden className="text-mist tabular-nums">
          [ {index} ]
        </span>
        {label}
      </Tag>
      <span
        aria-hidden
        className="border-rule-strong mb-1 h-px min-w-4 flex-1 self-end border-b border-dotted"
      />
      {aside ? (
        <span className="text-graphite shrink-0 tabular-nums">{aside}</span>
      ) : null}
    </div>
  );
