import type { AgentAction, AgentRole } from "@/lib/agents/roles";

export type BlueprintKind = "scene" | "scroll" | "system";

export interface FeaturedProject {
  slug: string;
  code: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  stack: readonly string[];
  buildNotes: readonly string[];
  blueprint: BlueprintKind;
  sample: boolean;
}

export const featuredProjects = [
  {
    blueprint: "scene",
    buildNotes: [
      "One shared Canvas, paused offscreen",
      "Static fallback renders before WebGL loads",
      "Pointer parallax disabled under reduced motion",
    ],
    code: "BLD-01",
    role: "Frontend, 3D",
    sample: true,
    slug: "sample-product-configurator",
    stack: ["Next.js", "R3F", "drei", "Zustand"],
    summary:
      "A product configurator where material and camera changes stay under one frame budget on mid-range phones.",
    title: "Product configurator",
    year: "2026",
  },
  {
    blueprint: "scroll",
    buildNotes: [
      "One pinned timeline, under three viewports long",
      "Mobile drops the pin for a stepped sequence",
      "Every chapter readable with motion off",
    ],
    code: "BLD-02",
    role: "Frontend, motion",
    sample: true,
    slug: "sample-editorial-launch",
    stack: ["Next.js", "GSAP", "Sanity"],
    summary:
      "An editorial launch page driven by scroll, with chapters authored in the CMS instead of hard-coded.",
    title: "Editorial launch",
    year: "2026",
  },
  {
    blueprint: "system",
    buildNotes: [
      "Tokens shared between Figma and Tailwind v4",
      "cva variants instead of near-duplicate components",
      "Distributed as a shadcn registry",
    ],
    code: "BLD-03",
    role: "Design systems",
    sample: true,
    slug: "sample-design-system",
    stack: ["Tailwind v4", "shadcn", "Base UI"],
    summary:
      "A component system rebuilt around tokens and variants, so new pages assemble instead of fork.",
    title: "Component system",
    year: "2025",
  },
] as const satisfies readonly FeaturedProject[];

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

export interface Experiment {
  slug: string;
  code: string;
  title: string;
  medium: string;
  note: string;
  sample: boolean;
}

export const experiments = [
  {
    code: "EXP-01",
    medium: "GLSL",
    note: "Dithered light falloff on a flat-shaded agent.",
    sample: true,
    slug: "sample-dither-shader",
    title: "Dither shader",
  },
  {
    code: "EXP-02",
    medium: "GSAP",
    note: "Text that reflows along a moving path without layout thrash.",
    sample: true,
    slug: "sample-path-type",
    title: "Path type",
  },
  {
    code: "EXP-03",
    medium: "R3F",
    note: "Instanced crates stacking under simple rigid-body rules.",
    sample: true,
    slug: "sample-crate-stack",
    title: "Crate stack",
  },
] as const satisfies readonly Experiment[];

export interface RegistryTeaser {
  name: string;
  kind: "block" | "component" | "hook";
  description: string;
  sample: boolean;
}

export const registryTeasers = [
  {
    description: "Lazy R3F Canvas with a static fallback and offscreen pause.",
    kind: "component",
    name: "lazy-stage",
    sample: true,
  },
  {
    description:
      "Pinned ScrollTrigger sequence with mobile and reduced variants.",
    kind: "block",
    name: "pinned-sequence",
    sample: true,
  },
  {
    description: "Reduced-motion preference as a synced external store.",
    kind: "hook",
    name: "use-reduced-motion",
    sample: true,
  },
] as const satisfies readonly RegistryTeaser[];
