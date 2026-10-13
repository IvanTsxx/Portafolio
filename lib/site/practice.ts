import type { StageId } from "@/lib/agents/stages";

export const workSteps = [
  {
    id: "orchestrate",
    jp: "指揮",
    summary: "Each Linear issue gets its own worktree and agent.",
    title: "Orchestrate",
  },
  {
    id: "research",
    jp: "探索",
    summary: "Agents read code and docs through skills and MCP servers.",
    title: "Research",
  },
  {
    id: "design-to-code",
    jp: "設計",
    summary: "Designs become animated, responsive code.",
    title: "Design to code",
  },
  {
    id: "build",
    jp: "実装",
    summary: "Next.js, TypeScript, Tailwind and shadcn. GSAP, Motion and R3F.",
    title: "Build",
  },
  {
    id: "debug",
    jp: "診断",
    summary: "Reproduce first, then trace the root cause.",
    title: "Debug",
  },
  {
    id: "review",
    jp: "判断",
    summary: "I set the criteria and own every merge.",
    title: "Review",
  },
  {
    href: "/lab",
    id: "explore",
    jp: "実験",
    summary: "Shaders, dithers and dot grids, built to learn.",
    title: "Explore",
  },
] as const satisfies readonly {
  href?: "/lab";
  id: StageId;
  jp: string;
  summary: string;
  title: string;
}[];

export type WorkStep = (typeof workSteps)[number];
