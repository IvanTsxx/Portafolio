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
  sheetWidth: "72rem",
} as const;

export interface AgentMotionSpec {
  label: string;
  value: string;
}

export const agentMotionSpecs = [
  { label: "Clip crossfade", value: "0.38 s" },
  { label: "Stage loop", value: "8 s" },
  { label: "Hover reaction", value: "Shuffled deck of 8" },
  { label: "Reduced motion", value: "Held key pose" },
] as const satisfies readonly AgentMotionSpec[];
