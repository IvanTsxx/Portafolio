import type { ReactNode } from "react";

import { AgentWaypoint } from "@/components/scene/agent-waypoint";
import type { AgentWaypointProps } from "@/components/scene/agent-waypoint";
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
  waypoint,
}: {
  aside?: ReactNode;
  as?: HeadingTag;
  className?: string;
  id?: string;
  index: string;
  jp?: string;
  label: string;
  waypoint?: AgentWaypointProps;
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
    {jp ? <span className="jp text-graphite shrink-0">{jp}</span> : null}
    <span
      aria-hidden
      className="border-rule-strong relative mb-1 h-px min-w-4 flex-1 self-end border-b border-dotted"
    >
      {waypoint ? (
        <AgentWaypoint
          {...waypoint}
          className={cn(
            "inset-auto inset-x-0 -top-24 -bottom-6",
            waypoint.className
          )}
        />
      ) : null}
    </span>
    {aside ? (
      <span className="text-graphite shrink-0 tabular-nums">{aside}</span>
    ) : null}
  </div>
);
