import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "p";

export const PanelHeading = ({
  aside,
  as: Tag = "h2",
  className,
  id,
  index,
  jp,
  label,
}: {
  aside?: ReactNode;
  as?: HeadingTag;
  className?: string;
  id?: string;
  index: string;
  jp?: string;
  label: string;
}) => (
  <div
    className={cn(
      "label border-rule-strong flex items-baseline gap-x-3 border-b pb-2",
      className
    )}
  >
    <span className="text-mist shrink-0 tabular-nums">[ {index} ]</span>
    <Tag className="text-ink m-0 shrink-0 font-normal" id={id}>
      {label}
    </Tag>
    {jp ? <span className="jp text-graphite shrink-0">{jp}</span> : null}
    <span
      aria-hidden
      className="border-rule-strong mb-1 h-px min-w-4 flex-1 self-end border-b border-dotted"
    />
    {aside ? (
      <span className="text-graphite shrink-0 tabular-nums">{aside}</span>
    ) : null}
  </div>
);
