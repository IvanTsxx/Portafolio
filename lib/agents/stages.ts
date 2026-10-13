export const stageIds = [
  "orchestrate",
  "research",
  "design-to-code",
  "build",
  "debug",
  "review",
  "explore",
] as const;

export type StageId = (typeof stageIds)[number];
