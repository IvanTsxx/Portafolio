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
    action: "measure",
    align: "end",
    edge: "top",
    role: "architect",
  },
  pinned: { action: "read", edge: "top", role: "researcher" },
  stack: { action: "carry", align: "center", edge: "top", role: "builder" },
  timeline: {
    action: "inspect",
    align: "center",
    edge: "bottom",
    role: "debugger",
  },
} as const satisfies Record<string, AgentSpotProps>;
