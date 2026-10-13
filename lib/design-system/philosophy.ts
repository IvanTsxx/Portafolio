export const principleIds = [
  "paper",
  "restraint",
  "ink",
  "hairlines",
  "companion",
  "motion",
] as const;

export type PrincipleId = (typeof principleIds)[number];

export interface Principle {
  id: PrincipleId;
  rule: string;
  title: string;
}

export const principles = [
  {
    id: "paper",
    rule: "A paper sheet with ink type and numbered panels.",
    title: "A dossier on paper",
  },
  {
    id: "restraint",
    rule: "Labels and short lines. Figures carry the story.",
    title: "80/20 minimalism",
  },
  {
    id: "ink",
    rule: "Ink on paper. Clay belongs to the companion.",
    title: "Ink only",
  },
  {
    id: "hairlines",
    rule: "Radius 0. Rules, hatch and backing sheets, no shadows.",
    title: "Hairlines, not shadows",
  },
  {
    id: "companion",
    rule: "One WebGL canvas, one agent. It narrates and builds.",
    title: "One companion",
  },
  {
    id: "motion",
    rule: "Every animation has a reduced-motion twin.",
    title: "Motion with a twin",
  },
] as const satisfies readonly Principle[];

export const guidance = {
  do: [
    "Use token classes: `bg-paper`, `text-ink`, `text-graphite`, `text-mist`, `border-rule`.",
    "Open each section with `DocumentSection` and give it a script in `lib/site/section-scripts.ts`.",
    "Keep touch targets at 44px and show `focus-visible` rings.",
    "Build one `cva` base with variants and merge classes with `cn`.",
    "Ship a static fallback when WebGL is off.",
  ],
  dont: [
    "Render `<Agent>` outside the companion or add a second `Canvas`.",
    "Use clay for UI chrome, links or buttons.",
    "Round corners, add shadows or hard-code hex and oklch values.",
    "Use Japanese outside route tabs, index page heroes and the nickname kana.",
    "Write a paragraph where a label or a figure would do.",
    "Animate layout properties.",
    "Invent clients, metrics or achievements.",
  ],
} as const;
