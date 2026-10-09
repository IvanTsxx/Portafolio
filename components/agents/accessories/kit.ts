import type { ComponentType } from "react";

export const agentAnchors = [
  "body",
  "face",
  "head",
  "leftArm",
  "rightArm",
  "torso",
] as const;

export type AgentAnchor = (typeof agentAnchors)[number];

export type AccessoryKit = Partial<Record<AgentAnchor, ComponentType>>;
