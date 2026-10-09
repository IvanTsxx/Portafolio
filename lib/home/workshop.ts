import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { workflowStages } from "@/lib/agents/workflow";
import type { WorkflowStageId } from "@/lib/agents/workflow";

export const worktreeLanes = [
  {
    branch: "feat/hero-scene",
    id: "lane-a",
    mcps: ["Figma"],
    role: "researcher",
    skills: ["r3f-fundamentals", "figma-design-to-code"],
  },
  {
    branch: "feat/workshop-timeline",
    id: "lane-b",
    mcps: ["Context7"],
    role: "builder",
    skills: ["gsap-scrolltrigger", "animation-accessibility"],
  },
  {
    branch: "fix/pin-on-resize",
    id: "lane-c",
    mcps: ["Linear"],
    role: "debugger",
    skills: ["diagnosing-bugs"],
  },
] as const satisfies readonly {
  id: string;
  branch: string;
  role: AgentRole;
  skills: readonly string[];
  mcps: readonly string[];
}[];

export type WorktreeLane = (typeof worktreeLanes)[number];

export const workshopStageNotes = {
  build: {
    action: "type",
    note: "Skills load as cartridges. MCP servers connect each lane to Figma, docs and Linear.",
  },
  integrate: {
    action: "celebrate",
    note: "Three lanes merge back into one branch. CI runs again on the result.",
  },
  issue: {
    action: "idle",
    note: "LIN-128 · Build the home workshop sequence. Scope, acceptance and Figma links.",
  },
  orchestrate: {
    action: "direct",
    note: "Orchestrator splits the issue. Architect names the data shape before code.",
  },
  review: {
    action: "inspect",
    note: "Typecheck, lint, build and a11y pass. I read every diff before it moves on.",
  },
  worktrees: {
    action: "point",
    note: "Conductor opens one workspace per task, each on its own git worktree.",
  },
} as const satisfies Record<
  WorkflowStageId,
  { note: string; action: AgentAction }
>;

export const workshopStages = workflowStages.map((stage) => ({
  ...stage,
  ...workshopStageNotes[stage.id],
}));

export type WorkshopStage = (typeof workshopStages)[number];

export const workshopStageCount = workshopStages.length;

export const stageIndexAtProgress = (progress: number) =>
  Math.min(
    workshopStageCount - 1,
    Math.max(0, Math.floor(progress * workshopStageCount))
  );

export const workshopStageAt = (index: number) => {
  const stage =
    workshopStages[Math.min(workshopStageCount - 1, Math.max(0, index))];
  if (!stage) {
    throw new Error(`No workshop stage at ${index}`);
  }
  return stage;
};

export const isRoleActiveInStage = (role: AgentRole, stageIndex: number) => {
  const stage = workshopStages[stageIndex];
  return stage?.agents.some((agent) => agent === role) ?? false;
};
