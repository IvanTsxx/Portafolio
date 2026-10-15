import type { ReactNode } from "react";

import { CompanionLines } from "@/components/scene/companion-lines";
import { PanelHeading } from "@/components/site/panel-heading";
import { SectionBuild } from "@/components/site/section-build";
import type { SectionScript } from "@/lib/site/section-scripts";
import { cn } from "@/lib/utils";

const silentLines: readonly string[] = [];

interface DocumentSectionProps {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  id: string;
  index: string;
  label: string;
  script?: SectionScript;
}

export const DocumentSection = ({
  aside,
  children,
  className,
  id,
  index,
  label,
  script,
}: DocumentSectionProps) => (
  <section
    aria-labelledby={`${id}-heading`}
    className={cn(
      "relative flex min-w-0 scroll-mt-20 flex-col gap-6",
      className
    )}
    data-index={index}
    id={id}
  >
    <PanelHeading aside={aside} id={`${id}-heading`} label={label} />
    <CompanionLines lines={script?.lines ?? silentLines} />
    {script?.reveal === "build" ? (
      <SectionBuild id={id}>{children}</SectionBuild>
    ) : (
      children
    )}
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
