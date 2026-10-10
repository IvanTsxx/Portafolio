"use client";

import { useId, useLayoutEffect, useRef } from "react";

import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { cn } from "@/lib/utils";

import type { WaypointSide } from "./view-registry";
import { registerWaypoint } from "./view-registry";

export interface AgentWaypointProps {
  role: AgentRole;
  action?: AgentAction;
  side?: WaypointSide;
  className?: string;
}

export const AgentWaypoint = ({
  role,
  action,
  side = "right",
  className,
}: AgentWaypointProps) => {
  const id = useId();
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = marker.current;
    if (!element) {
      return;
    }
    return registerWaypoint(id, { action, element, role, side });
  }, [action, id, role, side]);

  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      data-agent-waypoint={role}
      data-waypoint-action={action}
      data-waypoint-side={side}
      ref={marker}
    />
  );
};
