import type { ReactNode } from "react";

import type { AgentWaypointProps } from "@/components/scene/agent-waypoint";
import { PanelHeading } from "@/components/site/panel-heading";
import { cn } from "@/lib/utils";

interface DocumentSectionProps {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  id: string;
  index: string;
  jp: string;
  label: string;
  waypoint?: AgentWaypointProps;
}

export const DocumentSection = ({
  aside,
  children,
  className,
  id,
  index,
  jp,
  label,
  waypoint,
}: DocumentSectionProps) => (
  <section
    aria-labelledby={`${id}-heading`}
    className={cn(
      "relative flex min-w-0 scroll-mt-20 flex-col gap-6",
      className
    )}
    id={id}
  >
    <PanelHeading
      aside={aside}
      id={`${id}-heading`}
      index={index}
      jp={jp}
      label={label}
      waypoint={waypoint}
    />
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
