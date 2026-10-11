export const principleIds = [
  "paper",
  "restraint",
  "ink",
  "canvas",
  "motion",
  "visuals",
  "hairlines",
] as const;

export type PrincipleId = (typeof principleIds)[number];

export interface Principle {
  id: PrincipleId;
  jp: string;
  rule: string;
  title: string;
}

export const principles = [
  {
    id: "paper",
    jp: "紙",
    rule: "Paper ground, ink type, numbered sheets.",
    title: "Technical document on paper",
  },
  {
    id: "restraint",
    jp: "簡",
    rule: "Cut until 20 percent carries 80 percent.",
    title: "80/20 minimalism",
  },
  {
    id: "ink",
    jp: "墨",
    rule: "Ink and paper. Clay belongs to the 3D agents.",
    title: "Ink only, clay for agents",
  },
  {
    id: "canvas",
    jp: "一",
    rule: "One WebGL canvas for the whole site.",
    title: "One shared canvas",
  },
  {
    id: "motion",
    jp: "動",
    rule: "Every animation has a reduced-motion twin.",
    title: "Motion with purpose",
  },
  {
    id: "visuals",
    jp: "視",
    rule: "Labels and short lines. Visuals carry the story.",
    title: "Less text, more visuals",
  },
  {
    id: "hairlines",
    jp: "罫",
    rule: "Radius 0. Rules and hatch, no soft shadows.",
    title: "Hairlines, not shadows",
  },
] as const satisfies readonly Principle[];

export const guidance = {
  do: [
    "Use bg-paper, text-ink, text-graphite, text-mist and border-rule tokens.",
    "Set every annotation in the label utility and pair section labels with a jp annotation.",
    "Number panels as [ XX-NN ] LABEL 日本語 with a dotted leader and a count.",
    "Flip states in 100ms with ease-mechanical. Reveal with out-quart or out-quint.",
    "Keep hit areas at 44px on touch and use focus-visible rings.",
    "Build one base component with cva variants and merge classes with cn.",
    "Use Server Components by default and add use client only for interactivity.",
    "Mark where an agent stands with AgentWaypoint. Show a scene with AgentScene.",
    "Show a static meaningful fallback when WebGL is off.",
  ],
  dont: [
    "Add a second Canvas or a per-component WebGL context.",
    "Use clay orange for UI chrome, links or buttons.",
    "Round corners. Radius is 0 everywhere.",
    "Hard-code hex or oklch values. Use the token class.",
    "Invent clients, metrics or achievements. Label placeholders as sample content.",
    "Write paragraphs where a label, a number or a specimen would do.",
    "Animate layout properties or ship motion without a reduced-motion twin.",
    "Write ad-hoc CSS classes. Style in markup with Tailwind utilities and cva variants.",
    "Add comments to code.",
  ],
} as const;
