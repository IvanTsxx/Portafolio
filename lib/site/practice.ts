import type { StageId } from "@/lib/agents/stages";

export const workSteps = [
  {
    id: "orchestrate",
    summary: "Each Linear issue gets its own worktree and agent.",
    title: "Orchestrate",
  },
  {
    id: "research",
    summary: "Agents read code and docs through skills and MCP servers.",
    title: "Research",
  },
  {
    id: "design-to-code",
    summary: "Designs become animated, responsive code.",
    title: "Design to code",
  },
  {
    id: "build",
    summary: "Next.js, TypeScript, Tailwind and shadcn. GSAP, Motion and R3F.",
    title: "Build",
  },
  {
    id: "debug",
    summary: "Reproduce first, then trace the root cause.",
    title: "Debug",
  },
  {
    id: "review",
    summary: "I set the criteria and own every merge.",
    title: "Review",
  },
  {
    href: "/lab",
    id: "explore",
    summary: "Shaders, dithers and dot grids, built to learn.",
    title: "Explore",
  },
] as const satisfies readonly {
  href?: "/lab";
  id: StageId;
  summary: string;
  title: string;
}[];

export type WorkStep = (typeof workSteps)[number];
