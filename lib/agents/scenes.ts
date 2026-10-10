export const agentScenes = [
  "debugging",
  "figma-to-code",
  "feature",
  "code-search",
] as const;

export type AgentSceneId = (typeof agentScenes)[number];
