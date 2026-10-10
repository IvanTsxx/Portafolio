import type { AgentSpotProps } from "@/components/scene/agent-spot";

export const profileAgentSpots = {
  activityOverview: { action: "point", edge: "top", role: "analyst" },
  aiPractice: { action: "direct", edge: "top", role: "orchestrator" },
  contributionMatrix: {
    action: "inspect",
    align: "center",
    edge: "bottom",
    role: "researcher",
  },
  contributionStats: { action: "inspect", edge: "bottom", role: "inspector" },
  languageSpectrum: {
    action: "point",
    align: "start",
    edge: "top",
    role: "architect",
  },
  pinned: { action: "read", edge: "top", role: "researcher" },
  stack: { action: "carry", align: "end", edge: "top", role: "builder" },
  timeline: { action: "inspect", edge: "right", role: "debugger" },
} as const satisfies Record<string, AgentSpotProps>;
