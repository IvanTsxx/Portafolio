# Agent Workshop · Creative and engineering direction

The site is Ivan Bongiovanni's portfolio. A living digital workshop where small orange box-shaped 3D agents research, architect, build, debug, test and ship, while Ivan designs the system, orchestrates the agents and owns every decision. Agents assist. Ivan is responsible. Never portray the workflow as autonomous.

## Visual system

- 80% disciplined minimalism, 20% experimental interaction. Must read well with all motion off.
- Dark, monochrome, warm near-black. Orange (`clay`) is reserved for the agents and for one accent per view. No neon, no glow borders, no purple gradients, no SaaS color.
- Tokens live in `app/globals.css`. Use them: `bg-background`, `bg-card`, `bg-graphite`, `text-foreground`, `text-muted-foreground`, `text-faint`, `border-rule`, `border-rule-strong`, `text-clay`, `bg-clay`, `text-signal-steel`, `text-signal-moss`, `text-signal-rust`.
- Type. `display` utility (Archivo condensed, tight) for big editorial headings. Geist sans for body. `label` utility (Geist Mono, 11px, uppercase, tracked) for indices, metadata, coordinates, status.
- Vocabulary. `blueprint-grid`, `blueprint-dots`, `grain` utilities; hairline dividers; small corner markers; indices like `01`, `AG-03`; status dots; asymmetric editorial layouts; bento only where content is modular.
- Radius is small (`rounded-sm`/`rounded-md`). shadcn style is base-lyra (Base UI primitives, `render` prop, not `asChild`). Icons from `@phosphor-icons/react`.
- Round to the Tailwind scale. No arbitrary values unless a deliberate token.

## Domain model (already written, extend rather than duplicate)

- `lib/site/config.ts` owns identity, routes, socials, registry namespace and URL.
- `lib/agents/roles.ts` owns `AgentRole`, `AgentAction`, `agentProfiles`.
- `lib/agents/workflow.ts` owns `workflowStages` (Linear issue → Conductor → worktrees → agents → review → integrate).
- `components/agents/agent.tsx` exports `<Agent role action focused ...groupProps />`, an R3F group used inside a Canvas. It is a stub until the 3D stream lands; keep using that exact API.
- `components/scene/stage.tsx` exports `<Stage label camera frameloop>` Canvas wrapper.
- `lib/motion/gsap.ts` exports `motionKit = { gsap, ScrollTrigger, useGSAP }` with plugins registered. Import GSAP through it in client components.
- `hooks/use-reduced-motion.ts` exports `useReducedMotion()`.

## Hard rules

- No code comments of any kind. Names explain the code.
- Server Components by default. `"use client"` only for interactivity, 3D, GSAP.
- Lazy-load every Canvas (`next/dynamic` with `ssr: false` from a client wrapper) and render a static, meaningful fallback. Never load the 3D world on pages that do not need it.
- GSAP through `useGSAP` with scoped refs so cleanup is automatic. No React state updates per frame. ScrollTrigger never hijacks scroll; pins stay short; mobile gets a simplified or unpinned variant; reduced motion gets a static, complete composition.
- Content never invents clients, metrics, achievements or experience. Anything not real is labeled as sample content in the UI and in the data (`sample: true`).
- Never use Playwright in any form. For visual checks use `agent-browser` (run `agent-browser --help` first) against your own dev server port.
- Do not add dependencies unless the stream brief allows it. Installed: next 16, react 19, tailwind v4, shadcn (base), three, @react-three/fiber, @react-three/drei, gsap, @gsap/react, zod, shiki, rehype-pretty-code, @next/mdx, remark-gfm, rehype-slug, @phosphor-icons/react.
- Lint is ultracite (oxlint) and strict, including sort-keys. Run `bun x ultracite fix`, then `bun x oxlint`, `bun run typecheck`, `bun run build` before you report.
- This Next.js version differs from training data. Read `node_modules/next/dist/docs/` for any API you are unsure about.
