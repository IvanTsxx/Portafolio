import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelHeadingProps {
  index: string;
  label: string;
  jp: string;
  aside?: ReactNode;
}

export const PanelHeading = ({
  index,
  label,
  jp,
  aside,
}: PanelHeadingProps) => (
  <div className="label border-rule-strong flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3 border-b pb-2">
    <span className="flex items-baseline gap-3">
      <span className="text-mist tabular-nums">[ {index} ]</span>
      <span className="text-ink">{label}</span>
      <span className="jp text-mist">{jp}</span>
    </span>
    {aside}
  </div>
);

interface SectionFrameProps extends PanelHeadingProps {
  id: string;
  className?: string;
  children: ReactNode;
}

export const SectionFrame = ({
  id,
  index,
  label,
  jp,
  aside,
  className,
  children,
}: SectionFrameProps) => (
  <section
    aria-labelledby={`${id}-heading`}
    className={cn("flex min-w-0 scroll-mt-16 flex-col gap-6", className)}
    id={id}
  >
    <h2 className="sr-only" id={`${id}-heading`}>
      {label}
    </h2>
    <PanelHeading aside={aside} index={index} jp={jp} label={label} />
    {children}
  </section>
);

export const PanelCount = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <span className="text-mist tabular-nums">
    {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
  </span>
);
