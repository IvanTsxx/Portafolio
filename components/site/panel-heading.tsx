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
}) => (
  <div
    className={cn(
      "label border-rule-strong flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b pb-2",
      className
    )}
  >
    <span className="text-mist shrink-0 tabular-nums">[ {index} ]</span>
    <Tag className="text-ink m-0 shrink-0 font-normal" id={id}>
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
