import {
  blockBuildSeconds,
  buildBudgetSeconds,
  maxStaggerSeconds,
} from "@/lib/site/section-construction";

export const colorGroups = [
  "surface",
  "ink",
  "rule",
  "agent",
  "signal",
  "semantic",
] as const;

export type ColorGroup = (typeof colorGroups)[number];

export type ColorUtilityPrefix = "bg" | "border" | "text";

export interface ColorSpec {
  group: ColorGroup;
  name: string;
  on?: string;
  prefix: ColorUtilityPrefix;
  role: string;
}

export const colorGroupLabels = {
  agent: { label: "Agent" },
  ink: { label: "Ink" },
  rule: { label: "Rules" },
  semantic: { label: "shadcn aliases" },
  signal: { label: "Signals" },
  surface: { label: "Surface" },
} as const satisfies Record<ColorGroup, { label: string }>;

export const colorSpecs: readonly ColorSpec[] = [
  { group: "surface", name: "paper", prefix: "bg", role: "Sheet ground" },
  {
    group: "surface",
    name: "paper-deep",
    prefix: "bg",
    role: "Backing sheets, idle tabs, hover rows",
  },
  { group: "ink", name: "ink", prefix: "text", role: "Text and fills" },
  { group: "ink", name: "graphite", prefix: "text", role: "Secondary text" },
  { group: "ink", name: "mist", prefix: "text", role: "Indices, captions" },
  { group: "ink", name: "faint", prefix: "text", role: "Alias of mist" },
  { group: "rule", name: "rule", prefix: "border", role: "Hairlines" },
  {
    group: "rule",
    name: "rule-strong",
    prefix: "border",
    role: "Heading rules, sheet frame, leaders",
  },
  { group: "agent", name: "clay", prefix: "bg", role: "Companion only" },
  { group: "agent", name: "clay-deep", prefix: "bg", role: "Companion shade" },
  {
    group: "signal",
    name: "signal-steel",
    prefix: "text",
    role: "Status review",
  },
  {
    group: "signal",
    name: "signal-moss",
    prefix: "text",
    role: "Status done",
  },
  {
    group: "signal",
    name: "signal-rust",
    prefix: "text",
    role: "Accent",
  },
  {
    group: "signal",
    name: "destructive",
    prefix: "text",
    role: "Errors",
  },
  { group: "semantic", name: "background", prefix: "bg", role: "paper" },
  {
    group: "semantic",
    name: "foreground",
    on: "background",
    prefix: "text",
    role: "ink",
  },
  { group: "semantic", name: "card", prefix: "bg", role: "paper" },
  {
    group: "semantic",
    name: "card-foreground",
    on: "card",
    prefix: "text",
    role: "ink",
  },
  {
    group: "semantic",
    name: "popover",
    prefix: "bg",
    role: "Raised surface, code blocks",
  },
  {
    group: "semantic",
    name: "popover-foreground",
    on: "popover",
    prefix: "text",
    role: "ink",
  },
  { group: "semantic", name: "primary", prefix: "bg", role: "ink" },
  {
    group: "semantic",
    name: "primary-foreground",
    on: "primary",
    prefix: "text",
    role: "paper",
  },
  { group: "semantic", name: "secondary", prefix: "bg", role: "paper-deep" },
  {
    group: "semantic",
    name: "secondary-foreground",
    on: "secondary",
    prefix: "text",
    role: "ink",
  },
  { group: "semantic", name: "muted", prefix: "bg", role: "paper-deep" },
  {
    group: "semantic",
    name: "muted-foreground",
    on: "muted",
    prefix: "text",
    role: "graphite",
  },
  { group: "semantic", name: "accent", prefix: "bg", role: "paper-deep" },
  {
    group: "semantic",
    name: "accent-foreground",
    on: "accent",
    prefix: "text",
    role: "ink",
  },
  { group: "semantic", name: "border", prefix: "border", role: "Hairline" },
  { group: "semantic", name: "input", prefix: "border", role: "Input border" },
  { group: "semantic", name: "ring", prefix: "border", role: "ink" },
];

export interface EasingSpec {
  name: string;
  use: string;
}

export const easingSpecs = [
  { name: "mechanical", use: "State flips" },
  { name: "out-quart", use: "Fades, folds, nudges" },
  { name: "out-expo", use: "Image scale settles" },
] as const satisfies readonly EasingSpec[];

export type EasingName = (typeof easingSpecs)[number]["name"];

export interface DurationSpec {
  className: string;
  ease: EasingName;
  ms: number;
  name: string;
  use: string;
}

export const durationSpecs = [
  {
    className: "duration-100",
    ease: "mechanical",
    ms: 100,
    name: "instant",
    use: "Hover, focus, press",
  },
  {
    className: "duration-150",
    ease: "out-quart",
    ms: 150,
    name: "quick",
    use: "Overlays",
  },
  {
    className: "duration-200",
    ease: "out-quart",
    ms: 200,
    name: "short",
    use: "Tabs, tooltips",
  },
  {
    className: "duration-300",
    ease: "out-quart",
    ms: 300,
    name: "base",
    use: "Folds, notches",
  },
  {
    className: "duration-500",
    ease: "out-expo",
    ms: 500,
    name: "slow",
    use: "Image fades",
  },
  {
    className: "duration-700",
    ease: "mechanical",
    ms: 700,
    name: "scan",
    use: "Portrait scan",
  },
] as const satisfies readonly DurationSpec[];

export interface FontFamilySpec {
  className: string;
  cssVar: string;
  name: string;
  role: string;
  sample: string;
  sourceVar: string;
  weights: string;
}

export const fontFamilySpecs = [
  {
    className: "font-sans",
    cssVar: "--font-sans",
    name: "Zen Kaku Gothic New",
    role: "Body and display",
    sample: "Agent Workshop",
    sourceVar: "--font-zen-kaku",
    weights: "300 400 500 700",
  },
  {
    className: "font-mono",
    cssVar: "--font-mono",
    name: "Geist Mono",
    role: "Labels and numerals",
    sample: "[ DS-03 ] 0123",
    sourceVar: "--font-geist-mono",
    weights: "Variable",
  },
  {
    className: "font-jp",
    cssVar: "--font-jp",
    name: "Noto Sans JP",
    role: "Route tabs, page heroes, nickname kana",
    sample: "イヴォ",
    sourceVar: "--font-noto-jp",
    weights: "300 400 500",
  },
  {
    className: "font-wordmark",
    cssVar: "--font-wordmark",
    name: "Instrument Serif",
    role: "Wordmark only",
    sample: "Ivo",
    sourceVar: "--font-instrument-serif",
    weights: "400 italic",
  },
] as const satisfies readonly FontFamilySpec[];

export type FontClassName = (typeof fontFamilySpecs)[number]["className"];

export interface TypeStepSpec {
  className: string;
  sample: string;
  size: string;
  use: string;
}

export const typeScaleSpecs = [
  {
    className: "display text-8xl",
    sample: "Ivo",
    size: "60-128",
    use: "Page hero",
  },
  {
    className: "display text-5xl",
    sample: "Ivo",
    size: "48-72",
    use: "Detail title",
  },
  {
    className: "font-mono text-3xl font-light tracking-tight tabular-nums",
    sample: "0128",
    size: "30",
    use: "Readout numerals",
  },
  {
    className: "text-xl leading-tight font-light tracking-tight",
    sample: "Card title",
    size: "20",
    use: "Card titles",
  },
  {
    className: "text-base",
    sample: "Body copy in Zen Kaku.",
    size: "16",
    use: "Body",
  },
  {
    className: "text-graphite text-sm leading-relaxed",
    sample: "Secondary copy in graphite.",
    size: "14",
    use: "Summaries",
  },
  {
    className: "label",
    sample: "Label 10px tracked",
    size: "10",
    use: "Labels, buttons",
  },
] as const satisfies readonly TypeStepSpec[];

export interface UtilitySpec {
  name: string;
  summary: string;
  variable?: string;
}

export const utilitySpecs = [
  { name: "label", summary: "Geist Mono, 10px, tracked caps." },
  { name: "display", summary: "Zen Kaku light, 0.88 leading." },
  { name: "jp", summary: "Noto Sans JP, normal tracking." },
  { name: "hatch", summary: "Diagonal hairline fill." },
  { name: "hazard-stripe", summary: "Diagonal stripes in currentColor." },
  {
    name: "blueprint-grid",
    summary: "Square hairline grid.",
    variable: "--grid-size",
  },
  { name: "blueprint-dots", summary: "Dot grid.", variable: "--grid-size" },
  { name: "stamp-press", summary: "Stamps in as it scrolls into view." },
  {
    name: "scroll-reveal",
    summary: "Fades and rises 8px in after 150vh of scroll.",
  },
  {
    name: "scroll-dock",
    summary: "Sticky dock 250svh down, held 24px above the floor.",
  },
  {
    name: "ink-underline",
    summary: "Underline draws in on hover or focus, 160ms.",
  },
] as const satisfies readonly UtilitySpec[];

export type UtilityName = (typeof utilitySpecs)[number]["name"];

export interface SpacingStepSpec {
  px: number;
  step: string;
  use: string;
}

export const spacingSpecs = [
  { px: 4, step: "1", use: "Hairline gaps" },
  { px: 8, step: "2", use: "Chip gaps" },
  { px: 12, step: "3", use: "Inner stacks, phone gutter" },
  { px: 16, step: "4", use: "Cell padding, phone sheet inset" },
  { px: 24, step: "6", use: "Section stack" },
  { px: 32, step: "8", use: "Page gutter, md" },
  { px: 44, step: "11", use: "Touch target" },
  { px: 48, step: "12", use: "Sheet inset, md" },
  { px: 64, step: "16", use: "Hero bottom inset" },
  { px: 96, step: "24", use: "Section gap" },
] as const satisfies readonly SpacingStepSpec[];

export const radiusStepNames = ["sm", "md", "lg", "xl", "2xl"] as const;

export type RadiusStepName = (typeof radiusStepNames)[number];

export const documentGridSpec = {
  columnWidth: "44rem",
  containerClasses: ["max-w-sheet", "relative", "mx-auto"],
  gutter: "md:px-8",
  sectionGap: "gap-24",
  sheetInset: "md:px-12",
  sheetWidth: "60rem",
} as const;

export interface AgentMotionSpec {
  label: string;
  value: string;
}

export const agentMotionSpecs = [
  { label: "Clip crossfade", value: "0.38 s" },
  { label: "Stage loop", value: "8 s" },
  { label: "Hover reaction", value: "Shuffled deck of 8" },
  { label: "Phone dock", value: "Two thirds of the body above the edge" },
  { label: "Reduced motion", value: "Held key pose" },
] as const satisfies readonly AgentMotionSpec[];

const milliseconds = (seconds: number) => `${Math.round(seconds * 1000)} ms`;

export const componentMotionSpecs = [
  {
    label: "Section build",
    value: `${milliseconds(blockBuildSeconds)} per block, ${milliseconds(maxStaggerSeconds)} stagger, ${milliseconds(buildBudgetSeconds)} max`,
  },
  { label: "Cassette tape", value: "Out 24 px, peek 12 px, nudge 4 px" },
  { label: "J-card fold", value: "450 ms out-quart" },
  { label: "Graph cell", value: "100 ms to clay" },
] as const satisfies readonly AgentMotionSpec[];

export interface ComponentSpec {
  name: string;
  summary: string;
}

export const componentSpecs = [
  {
    name: "Panel heading",
    summary: "[ XX-NN ] code, mono label, dotted leader, aside.",
  },
  {
    name: "Page hero",
    summary:
      "Doc code, display title, hazard stripe, lede, over a seeded dither field at 10% ink.",
  },
  {
    name: "Figure plate",
    summary: "Framed figure with corner marks and one readout row.",
  },
  { name: "Specimen cell", summary: "Hairline cell. Hover fills paper-deep." },
  {
    name: "Button",
    summary: "Mono label, 44px, solid ink or outline. Hover inverts.",
  },
  {
    name: "Chip",
    summary: "Mono label in a frame. Pressed chips invert to ink.",
  },
  {
    name: "Link",
    summary: "ink-underline draws on hover or focus. Cards show corner marks.",
  },
  {
    name: "Card thumbnail",
    summary:
      "Static markup inside the card link. No links, buttons or focus stops.",
  },
  {
    name: "Window envelopes",
    summary: "Experience. One envelope per role. The current job opens first.",
  },
  {
    name: "Cassette tower",
    summary:
      "Repos. The most-starred tape opens first. One tape out at a time.",
  },
  {
    name: "Contribution graph",
    summary: "Compact week grid. Cells turn clay on hover and focus.",
  },
  {
    name: "Open in menu",
    summary:
      "Copies the page Markdown or opens it in ChatGPT, Claude or Perplexity.",
  },
  {
    name: "Back to top",
    summary: "44px button floating on the bound edge, bottom left.",
  },
  {
    name: "Companion",
    summary:
      "The one 3D agent, 48×56 on the rail, peeking from the corner on phones. It narrates and builds.",
  },
] as const satisfies readonly ComponentSpec[];
