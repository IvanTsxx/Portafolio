export const agentScenes = ["debugging"] as const;

export type AgentSceneId = (typeof agentScenes)[number];
