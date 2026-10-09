import type { AgentAction, AgentRole } from "@/lib/agents/roles";

export type BlueprintKind = "scene" | "scroll" | "system";

export const blueprintSequence = [
  "scene",
  "scroll",
  "system",
] as const satisfies readonly BlueprintKind[];

export interface Capability {
  id: string;
  index: string;
  title: string;
  statement: string;
  practices: readonly string[];
  toolkit: readonly string[];
  agent: { role: AgentRole; action: AgentAction };
}

export const capabilities = [
  {
    agent: { action: "type", role: "builder" },
    id: "frontend",
    index: "C-01",
    practices: [
      "Server Components by default, client islands where interaction lives",
      "Typed data shapes named before the first component",
      "Pages that hold up on slow networks and small screens",
    ],
    statement:
      "Production interfaces in Next.js and TypeScript, built from the data shape outward.",
    title: "Frontend Engineering",
    toolkit: ["Next.js", "React", "TypeScript", "Tailwind v4"],
  },
  {
    agent: { action: "wave", role: "builder" },
    id: "motion",
    index: "C-02",
    practices: [
      "Composite-only properties, measured against the frame budget",
      "Scroll that responds without hijacking",
      "A reduced-motion variant for every animation",
    ],
    statement:
      "Motion that explains state and pacing, tuned until it feels inevitable.",
    title: "Motion & Interaction",
    toolkit: ["GSAP", "ScrollTrigger", "Motion", "CSS"],
  },
  {
    agent: { action: "inspect", role: "architect" },
    id: "3d",
    index: "C-03",
    practices: [
      "Lazy Canvases with static fallbacks and no layout shift",
      "Demand rendering and DPR clamps for battery and heat",
      "Scenes driven by refs, never by per-frame React state",
    ],
    statement:
      "Real-time 3D on the web that earns its place in the page and its cost on the GPU.",
    title: "3D Development",
    toolkit: ["Three.js", "React Three Fiber", "drei", "GLSL"],
  },
  {
    agent: { action: "direct", role: "orchestrator" },
    id: "orchestration",
    index: "C-04",
    practices: [
      "Linear issues split into parallel tasks in Conductor",
      "Isolated git worktrees so agents never share a checkout",
      "Custom skills and MCP servers when a workflow repeats",
    ],
    statement:
      "AI-assisted development as a system I design and review, not a prompt I hope works.",
    title: "AI Orchestration",
    toolkit: ["Conductor", "git worktree", "Skills", "MCP"],
  },
  {
    agent: { action: "point", role: "architect" },
    id: "design-systems",
    index: "C-05",
    practices: [
      "Figma variables mapped to existing tokens first",
      "One base component with typed variants",
      "Registries so other projects install, not copy",
    ],
    statement:
      "Tokens, primitives and variants that keep a codebase coherent as it grows.",
    title: "Design Systems",
    toolkit: ["Figma", "shadcn", "cva", "Base UI"],
  },
  {
    agent: { action: "read", role: "researcher" },
    id: "content",
    index: "C-06",
    practices: [
      "Page-builder blocks that own schema, query, types and view",
      "Types derived from the schema, declared once",
      "Editors preview what ships",
    ],
    statement:
      "CMS structures editors can use without breaking the design or calling a developer.",
    title: "Content Architecture",
    toolkit: ["Sanity", "GROQ", "MDX", "Zod"],
  },
  {
    agent: { action: "inspect", role: "inspector" },
    id: "quality",
    index: "C-07",
    practices: [
      "Typecheck, lint and build pass before anything is called done",
      "Keyboard, focus and reduced motion checked on the real page",
      "Bugs reproduced before they are fixed",
    ],
    statement:
      "Verification against the real artifact, not against the feeling that it compiles.",
    title: "Testing & Quality",
    toolkit: ["TypeScript", "oxlint", "bun test", "agent-browser"],
  },
] as const satisfies readonly Capability[];

export type CapabilityId = (typeof capabilities)[number]["id"];
