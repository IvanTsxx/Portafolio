import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import type { AgentSpotEdge } from "@/lib/agents/scenes";
import { cn } from "@/lib/utils";

export interface AgentSpotProps {
  role: AgentRole;
  action?: AgentAction;
  edge: AgentSpotEdge;
  align?: "start" | "center" | "end";
  size?: "xs" | "sm";
  className?: string;
}

export const AgentSpot = ({
  role,
  action = "idle",
  edge,
  align = "end",
  size = "sm",
  className,
}: AgentSpotProps) => (
  <span
    aria-hidden
    className={cn("pointer-events-none absolute", className)}
    data-agent-action={action}
    data-agent-align={align}
    data-agent-edge={edge}
    data-agent-role={role}
    data-agent-size={size}
  />
);
