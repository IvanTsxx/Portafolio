export interface Capability {
  id: string;
  label: string;
  summary: string;
  tools: readonly string[];
  evidence: readonly { href: string; label: string }[];
}

export const capabilities = [
  {
    evidence: [{ href: "/notes", label: "Writing" }],
    id: "frontend",
    label: "Frontend",
    summary: "Production interfaces, from component systems to whole routes.",
    tools: ["React", "Next.js", "TypeScript", "Angular", "Accessibility"],
  },
  {
    evidence: [
      { href: "/experiments", label: "Lab" },
      { href: "/experiments/lunar-dither", label: "Lunar dither" },
    ],
    id: "creative",
    label: "Creative development",
    summary: "Real-time rendering, shaders and motion that explains something.",
    tools: ["React Three Fiber", "Three.js", "GLSL", "GSAP", "Motion"],
  },
  {
    evidence: [
      { href: "/registry", label: "Registry" },
      { href: "/design-system", label: "Design system" },
    ],
    id: "systems",
    label: "Styling and systems",
    summary: "Tokens, variants and components that other people can install.",
    tools: ["Tailwind CSS", "shadcn/ui", "Base UI", "cva", "Design to code"],
  },
  {
    evidence: [{ href: "/skills", label: "Agent skills" }],
    id: "workflow",
    label: "Tools and workflow",
    summary: "Reproduce first, measure before optimizing, review every merge.",
    tools: ["Bun", "Testing", "Profiling", "Agents and MCP", "Git"],
  },
] as const satisfies readonly Capability[];
