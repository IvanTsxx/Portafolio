import type { AgentSceneId } from "@/lib/agents/scenes";

export const workSteps = [
  {
    id: "orchestrate",
    jp: "指揮",
    scene: "orchestrate",
    summary:
      "Each Linear issue gets a Conductor workspace on its own git worktree. Agents take the tasks, subagents only when the task needs them.",
    title: "Orchestrate",
  },
  {
    id: "research",
    jp: "探索",
    scene: "code-search",
    summary:
      "Agents read the code and the docs through reusable skills and MCP servers. New skills and MCPs when a workflow repeats.",
    title: "Research",
  },
  {
    id: "design-to-code",
    jp: "設計",
    scene: "figma-to-code",
    summary: "Designs become code, animated and fully responsive.",
    title: "Design to code",
  },
  {
    id: "build",
    jp: "実装",
    scene: "feature",
    summary:
      "Features built with Next.js, TypeScript, Tailwind and shadcn, animated with GSAP, Motion and R3F.",
    title: "Build",
  },
  {
    id: "debug",
    jp: "診断",
    scene: "debugging",
    summary: "Reproduce first, then trace the root cause before any fix.",
    title: "Debug",
  },
  {
    id: "review",
    jp: "判断",
    scene: "review",
    summary:
      "I set the criteria, review every change and own the decision before it merges.",
    title: "Review",
  },
] as const satisfies readonly {
  id: string;
  jp: string;
  scene: AgentSceneId;
  summary: string;
  title: string;
}[];

export type WorkStep = (typeof workSteps)[number];
