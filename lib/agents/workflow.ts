import type { AgentRole } from "@/lib/agents/roles";

export const workflowStages = [
  {
    agents: [],
    id: "issue",
    index: "01",
    summary: "A scoped issue enters the workshop as a blueprint.",
    title: "Issue",
    tool: "Linear",
  },
  {
    agents: ["orchestrator", "architect"],
    id: "orchestrate",
    index: "02",
    summary: "I decide what runs in parallel and what stays with me.",
    title: "Orchestrate",
    tool: "Conductor",
  },
  {
    agents: ["orchestrator"],
    id: "worktrees",
    index: "03",
    summary:
      "Each task gets an isolated lane, so agents never share a checkout.",
    title: "Worktrees",
    tool: "git worktree",
  },
  {
    agents: ["researcher", "builder", "debugger"],
    id: "build",
    index: "04",
    summary:
      "Specialists research, build and debug, loaded with reusable skills.",
    title: "Build",
    tool: "Agents + skills + MCPs",
  },
  {
    agents: ["inspector", "analyst"],
    id: "review",
    index: "05",
    summary: "I review architecture, behavior and quality. Checks must pass.",
    title: "Review",
    tool: "Me",
  },
  {
    agents: ["builder", "inspector"],
    id: "integrate",
    index: "06",
    summary: "Lanes converge into one verified deliverable.",
    title: "Integrate",
    tool: "git + CI",
  },
] as const satisfies readonly {
  id: string;
  index: string;
  title: string;
  tool: string;
  summary: string;
  agents: readonly AgentRole[];
}[];

export type WorkflowStage = (typeof workflowStages)[number];
export type WorkflowStageId = WorkflowStage["id"];
