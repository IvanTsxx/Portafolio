import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { cn } from "@/lib/utils";

export interface AgentWaypointProps {
  role: AgentRole;
  action?: AgentAction;
  side?: "left" | "right";
  className?: string;
}

export const AgentWaypoint = ({
  role,
  action,
  side = "right",
  className,
}: AgentWaypointProps) => (
  <span
    aria-hidden
    className={cn("pointer-events-none absolute inset-0", className)}
    data-agent-waypoint={role}
    data-waypoint-action={action}
    data-waypoint-side={side}
  />
);
