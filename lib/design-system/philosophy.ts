export interface Principle {
  rule: string;
  title: string;
}

export const principles = [
  {
    rule: "The shell stays minimal. Lab demos carry the experiments.",
    title: "Quiet interface, expressive artifacts",
  },
  {
    rule: "Signal marks state and live things, never a large fill.",
    title: "Monochrome first",
  },
  {
    rule: "Every animation explains something, and has a reduced-motion twin.",
    title: "Precision in motion",
  },
  {
    rule: "Light and dark are both art-directed, with the same hierarchy.",
    title: "Dark and light",
  },
  {
    rule: "Every figure on screen is computed or sourced.",
    title: "True readouts",
  },
] as const satisfies readonly Principle[];

export const guidance = {
  do: [
    "Use semantic token classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-surface`, `border-border`.",
    "Check every change in light and dark, at 1440 and 390 wide.",
    "Build hierarchy with type and whitespace before adding boxes.",
    "Build one `cva` base with variants and merge classes with `cn`.",
    "Animate transform and opacity, and give each animation a reduced-motion twin.",
    "Show `focus-visible` outlines.",
    "Ship a static fallback when WebGL is off.",
  ],
  dont: [
    "Hard-code hex values or add arbitrary Tailwind values outside the theme.",
    "Use `signal` for chrome or large fills.",
    "Add shadows, or gradients as default chrome.",
    "Add a second `Canvas`.",
    "Hide essential information behind hover or animation.",
    "Use more than three font families.",
    "Invent clients, metrics or achievements.",
  ],
} as const;
