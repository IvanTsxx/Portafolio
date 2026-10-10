export const agentScenes = [
  "orchestrate",
  "code-search",
  "figma-to-code",
  "feature",
  "debugging",
  "review",
] as const;

export type AgentSceneId = (typeof agentScenes)[number];
