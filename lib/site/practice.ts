export const aiPractice = [
  {
    id: "conductor",
    jp: "指揮",
    summary:
      "Conductor workspaces on isolated git worktrees, one per Linear issue.",
    title: "Conductor + worktrees",
  },
  {
    id: "agents",
    jp: "代理",
    summary: "Agents per task, subagents only when the task needs them.",
    title: "Agents & subagents",
  },
  {
    id: "skills",
    jp: "技能",
    summary: "Reusable skills, and new ones when a workflow repeats.",
    title: "Skills",
  },
  {
    id: "mcp",
    jp: "接続",
    summary: "MCP servers to reach tools, and custom ones when needed.",
    title: "MCPs",
  },
  {
    id: "design-to-code",
    jp: "設計",
    summary: "Designs to code, animated and fully responsive.",
    title: "Design to code",
  },
  {
    id: "judgment",
    jp: "判断",
    summary: "The criteria to guide agents and own every decision.",
    title: "Judgment",
  },
] as const;

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
