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
  index?: string;
  label: string;
}) =>
  label.trim() === "" ? null : (
    <div
      className={cn(
        "label flex flex-wrap items-center gap-x-4 gap-y-2",
        className
      )}
    >
      {index ? <span className="text-faint tabular-nums">{index}</span> : null}
      <Tag className="text-foreground m-0 shrink-0 font-normal" id={id}>
        {label}
      </Tag>
      <span aria-hidden className="bg-border h-px min-w-4 flex-1" />
      {aside ? (
        <span className="text-muted-foreground shrink-0 tabular-nums">
          {aside}
        </span>
      ) : null}
    </div>
  );
