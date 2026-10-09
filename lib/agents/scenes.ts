export const agentScenes = [
  "debugging",
  "figma-to-code",
  "feature",
  "code-search",
] as const;

export type AgentSceneId = (typeof agentScenes)[number];

export const agentSpotEdges = ["top", "right", "bottom", "left"] as const;

export type AgentSpotEdge = (typeof agentSpotEdges)[number];
