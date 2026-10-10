import type { AgentSpotProps } from "@/components/scene/agent-spot";

export const agentSpots = {
  architectRow: {
    action: "point",
    edge: "right",
    role: "architect",
    size: "xs",
  },
  builderCard: {
    action: "type",
    align: "end",
    edge: "top",
    role: "builder",
    size: "xs",
  },
  debuggerCard: {
    action: "inspect",
    align: "end",
    edge: "top",
    role: "debugger",
    size: "xs",
  },
  researcherRow: {
    action: "read",
    edge: "right",
    role: "researcher",
    size: "xs",
  },
} as const satisfies Record<string, AgentSpotProps>;
