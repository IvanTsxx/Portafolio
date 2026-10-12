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
  lines?: readonly string[];
  className?: string;
}

const silent: readonly string[] = [];

export const AgentWaypoint = ({
  role,
  action,
  side = "right",
  lines = silent,
  className,
}: AgentWaypointProps) => {
  const id = useId();
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = marker.current;
    if (!element) {
      return;
    }
    return registerWaypoint(id, { action, element, lines, role, side });
  }, [action, id, lines, role, side]);

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
