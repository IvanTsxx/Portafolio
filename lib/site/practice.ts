import type { AgentSceneId } from "@/lib/agents/scenes";

export const workSteps = [
  {
    id: "orchestrate",
    jp: "指揮",
    scene: "feature",
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
    id: "review",
    jp: "判断",
    scene: "debugging",
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

export const stack = [
  { code: "NX", jp: "枠組", name: "Next.js" },
  { code: "SN", jp: "内容", name: "Sanity" },
  { code: "TW", jp: "様式", name: "Tailwind CSS" },
  { code: "SC", jp: "部品", name: "shadcn/ui" },
  { code: "CS", jp: "様式", name: "CSS" },
  { code: "MO", jp: "動き", name: "Motion" },
  { code: "GS", jp: "動き", name: "GSAP" },
  { code: "R3", jp: "立体", name: "React Three Fiber" },
  { code: "DR", jp: "立体", name: "Drei" },
  { code: "TS", jp: "型", name: "TypeScript" },
  { code: "BN", jp: "実行", name: "Bun" },
  { code: "BT", jp: "試験", name: "bun test" },
] as const;

export const practiceNotes = [
  "One shared canvas that injects each scene where it is needed, never a duplicate canvas.",
] as const;
