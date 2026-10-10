export const colorGroups = [
  "surface",
  "ink",
  "rule",
  "agent",
  "signal",
  "semantic",
  "chart",
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
  agent: { jp: "代理", label: "Agents" },
  chart: { jp: "図表", label: "Chart" },
  ink: { jp: "墨", label: "Ink" },
  rule: { jp: "罫線", label: "Rules" },
  semantic: { jp: "意味", label: "Semantic aliases" },
  signal: { jp: "信号", label: "Signals" },
  surface: { jp: "紙", label: "Surface" },
} as const satisfies Record<ColorGroup, { jp: string; label: string }>;

export const colorSpecs: readonly ColorSpec[] = [
  {
    group: "surface",
    name: "paper",
    prefix: "bg",
    role: "Page and card ground",
  },
  {
    group: "surface",
    name: "paper-deep",
    prefix: "bg",
    role: "Recessed fill, hover rows, active cells",
  },
  {
    group: "ink",
    name: "ink",
    prefix: "text",
    role: "Primary text, solid fills, focus ring, strong borders",
  },
  {
    group: "ink",
    name: "graphite",
    prefix: "text",
    role: "Secondary text, outline borders, selected fills",
  },
  {
    group: "ink",
    name: "mist",
    prefix: "text",
    role: "Indices, captions, tertiary labels",
  },
  {
    group: "ink",
    name: "faint",
    prefix: "text",
    role: "Alias of mist for muted marks",
  },
  {
    group: "rule",
    name: "rule",
    prefix: "border",
    role: "Hairlines between cells and rows",
  },
  {
    group: "rule",
    name: "rule-strong",
    prefix: "border",
    role: "Panel heading underline, dashed frames, leaders",
  },
  {
    group: "agent",
    name: "clay",
    prefix: "bg",
    role: "Reserved for the 3D agents and their status marks",
  },
  {
    group: "agent",
    name: "clay-deep",
    prefix: "bg",
    role: "Agent shade: legs, arms, deep surfaces",
  },
  {
    group: "signal",
    name: "signal-steel",
    prefix: "text",
    role: "In review",
  },
  {
    group: "signal",
    name: "signal-moss",
    prefix: "text",
    role: "Done",
  },
  {
    group: "signal",
    name: "signal-rust",
    prefix: "text",
    role: "Vermilion accent, sparingly",
  },
  {
    group: "signal",
    name: "destructive",
    prefix: "text",
    role: "Blocked and invalid",
  },
  {
    group: "semantic",
    name: "background",
    prefix: "bg",
    role: "App background (paper)",
  },
  {
    group: "semantic",
    name: "foreground",
    on: "background",
    prefix: "text",
    role: "Default text (ink)",
  },
  {
    group: "semantic",
    name: "card",
    prefix: "bg",
    role: "Card surface",
  },
  {
    group: "semantic",
    name: "card-foreground",
    on: "card",
    prefix: "text",
    role: "Text on cards",
  },
  {
    group: "semantic",
    name: "popover",
    prefix: "bg",
    role: "Raised surface: popovers, callouts, previews",
  },
  {
    group: "semantic",
    name: "popover-foreground",
    on: "popover",
    prefix: "text",
    role: "Text on popovers",
  },
  {
    group: "semantic",
    name: "primary",
    prefix: "bg",
    role: "Primary fill",
  },
  {
    group: "semantic",
    name: "primary-foreground",
    on: "primary",
    prefix: "text",
    role: "Text on primary",
  },
  {
    group: "semantic",
    name: "secondary",
    prefix: "bg",
    role: "Secondary fill",
  },
  {
    group: "semantic",
    name: "secondary-foreground",
    on: "secondary",
    prefix: "text",
    role: "Text on secondary",
  },
  {
    group: "semantic",
    name: "muted",
    prefix: "bg",
    role: "Muted fill",
  },
  {
    group: "semantic",
    name: "muted-foreground",
    on: "muted",
    prefix: "text",
    role: "Muted text",
  },
  {
    group: "semantic",
    name: "accent",
    prefix: "bg",
    role: "Hover and active fill",
  },
  {
    group: "semantic",
    name: "accent-foreground",
    on: "accent",
    prefix: "text",
    role: "Text on accent",
  },
  {
    group: "semantic",
    name: "border",
    prefix: "border",
    role: "Default border",
  },
  {
    group: "semantic",
    name: "input",
    prefix: "border",
    role: "Input border",
  },
  {
    group: "semantic",
    name: "ring",
    prefix: "border",
    role: "Focus ring",
  },
  {
    group: "chart",
    name: "chart-1",
    prefix: "bg",
    role: "Series 1",
  },
  {
    group: "chart",
    name: "chart-2",
    prefix: "bg",
    role: "Series 2",
  },
  {
    group: "chart",
    name: "chart-3",
    prefix: "bg",
    role: "Series 3",
  },
  {
    group: "chart",
    name: "chart-4",
    prefix: "bg",
    role: "Series 4",
  },
  {
    group: "chart",
    name: "chart-5",
    prefix: "bg",
    role: "Series 5",
  },
];

export interface EasingSpec {
  name: string;
  use: string;
}

export const easingSpecs = [
  {
    name: "mechanical",
    use: "State flips: hover, press, focus, ink swap. Pairs with 100ms.",
  },
  {
    name: "out-quart",
    use: "Fades and arrow nudges that settle softly. 150 to 500ms.",
  },
  {
    name: "out-quint",
    use: "Reveals and underline draws. Pairs with 300ms.",
  },
  {
    name: "out-expo",
    use: "Scale and magnetic settles with a long tail. Pairs with 500ms.",
  },
  {
    name: "in-out-quart",
    use: "Reserved for on-screen moves that start and stop.",
  },
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
    use: "Hover, focus, press, ink swaps",
  },
  {
    className: "duration-150",
    ease: "out-quart",
    ms: 150,
    name: "quick",
    use: "Covers, overlays, cell highlights",
  },
  {
    className: "duration-200",
    ease: "out-quart",
    ms: 200,
    name: "short",
    use: "Icon nudges, small translates",
  },
  {
    className: "duration-300",
    ease: "out-quint",
    ms: 300,
    name: "base",
    use: "Reveals, fade and slide, row arrows",
  },
  {
    className: "duration-500",
    ease: "out-expo",
    ms: 500,
    name: "slow",
    use: "Image fades, scale settles",
  },
  {
    className: "duration-700",
    ease: "mechanical",
    ms: 700,
    name: "scan",
    use: "Portrait scan and clip reveals",
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
    role: "Body and display. Light for big names.",
    sample: "Agent Workshop",
    sourceVar: "--font-zen-kaku",
    weights: "300 400 500 700",
  },
  {
    className: "font-mono",
    cssVar: "--font-mono",
    name: "Geist Mono",
    role: "Labels, numerals, code",
    sample: "[ DS-03 ] 0123",
    sourceVar: "--font-geist-mono",
    weights: "Variable",
  },
  {
    className: "font-jp",
    cssVar: "--font-jp",
    name: "Noto Sans JP",
    role: "Japanese annotations beside section labels",
    sample: "日本語の注釈",
    sourceVar: "--font-noto-jp",
    weights: "300 400 500",
  },
  {
    className: "font-wordmark",
    cssVar: "--font-wordmark",
    name: "Instrument Serif",
    role: "Site wordmark only",
    sample: "Ivan",
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
    className: "display text-9xl",
    sample: "Ivan",
    size: "128",
    use: "Hero title, xl and up",
  },
  {
    className: "display text-8xl",
    sample: "Ivan",
    size: "96",
    use: "Hero title, md",
  },
  {
    className: "display text-7xl",
    sample: "Ivan",
    size: "72",
    use: "Hero title, sm. Detail page title, md",
  },
  {
    className: "display text-6xl",
    sample: "Ivan",
    size: "60",
    use: "Hero title, base",
  },
  {
    className: "display text-5xl",
    sample: "Ivan",
    size: "48",
    use: "Detail page title, base",
  },
  {
    className: "font-mono text-3xl font-light tracking-tight tabular-nums",
    sample: "0128",
    size: "30",
    use: "Readout numerals",
  },
  {
    className: "text-3xl leading-tight font-light tracking-tight",
    sample: "Name plate",
    size: "30",
    use: "Dossier name",
  },
  {
    className: "text-xl leading-tight font-light tracking-tight",
    sample: "Card title",
    size: "20",
    use: "Cell and card titles",
  },
  {
    className: "text-base",
    sample: "Body copy in Zen Kaku.",
    size: "16",
    use: "Body, prose",
  },
  {
    className: "text-graphite text-sm leading-relaxed",
    sample: "Secondary copy in graphite.",
    size: "14",
    use: "Summaries, notes",
  },
  {
    className: "label",
    sample: "Label 10px tracked",
    size: "10",
    use: "Every annotation, heading, button and chip",
  },
] as const satisfies readonly TypeStepSpec[];

export interface UtilitySpec {
  name: string;
  summary: string;
  usage: string;
  variable?: string;
}

export const utilitySpecs = [
  {
    name: "label",
    summary: "Geist Mono, 10px, tracked caps. Annotations, headings, chips.",
    usage: '<span className="label text-mist">Doc</span>',
  },
  {
    name: "display",
    summary: "Zen Kaku light, tight tracking, 0.88 leading, balanced.",
    usage: '<h1 className="display text-ink text-8xl">Title</h1>',
  },
  {
    name: "jp",
    summary: "Noto Sans JP, normal tracking, no case transform.",
    usage: '<span className="jp text-graphite">哲学</span>',
  },
  {
    name: "hatch",
    summary: "Diagonal hairline fill in rule color.",
    usage: '<div className="hatch border border-dashed" />',
  },
  {
    name: "hazard-stripe",
    summary: "Diagonal stripes in the current text color.",
    usage: '<span className="hazard-stripe text-ink block h-1.5 w-24" />',
  },
  {
    name: "blueprint-grid",
    summary: "Square hairline grid. Cell size is a CSS variable.",
    usage: '<div className="blueprint-grid [--grid-size:24px]" />',
    variable: "--grid-size",
  },
  {
    name: "blueprint-dots",
    summary: "Dot grid in rule color. Spacing is a CSS variable.",
    usage: '<div className="blueprint-dots [--grid-size:16px]" />',
    variable: "--grid-size",
  },
  {
    name: "grain",
    summary: "Paper noise tile from the --grain data URL.",
    usage: '<div className="grain bg-paper-deep" />',
  },
  {
    name: "hairline",
    summary: "Border color set to the rule token.",
    usage: '<div className="hairline border" />',
  },
  {
    name: "min-h-below-header",
    summary: "Minimum height of the viewport minus the 48px header.",
    usage: '<section className="min-h-below-header" />',
  },
  {
    name: "h-below-header",
    summary: "Height of the viewport minus the 48px header.",
    usage: '<section className="h-below-header" />',
  },
] as const satisfies readonly UtilitySpec[];

export type UtilityName = (typeof utilitySpecs)[number]["name"];

export interface SpacingStepSpec {
  px: number;
  step: string;
  use: string;
}

export const spacingSpecs = [
  { px: 4, step: "1", use: "Hairline gaps, icon nudges" },
  { px: 8, step: "2", use: "Chip gaps, label to value" },
  { px: 12, step: "3", use: "Inner stacks, hit-area growth" },
  { px: 16, step: "4", use: "Cell padding, page gutter" },
  { px: 20, step: "5", use: "Cell padding from md" },
  { px: 24, step: "6", use: "Panel stack, column gutter" },
  { px: 32, step: "8", use: "Page gutter from md" },
  { px: 44, step: "11", use: "Minimum touch target" },
  { px: 64, step: "16", use: "Gap between sections" },
  { px: 96, step: "24", use: "Page bottom padding" },
] as const satisfies readonly SpacingStepSpec[];

export const radiusStepNames = ["sm", "md", "lg", "xl", "2xl"] as const;

export type RadiusStepName = (typeof radiusStepNames)[number];

export interface BreakpointSpec {
  changes: string;
  name: string;
  px: number;
}

export const breakpointSpecs = [
  {
    changes: "Companion walks between waypoints. Below it sits small and swaps",
    name: "sm",
    px: 640,
  },
  {
    changes: "Page gutter 16 to 32. Chip targets shrink from 44 to 32",
    name: "md",
    px: 768,
  },
  {
    changes: "12-column grid, sticky dossier",
    name: "lg",
    px: 1024,
  },
  { changes: "Largest hero title", name: "xl", px: 1280 },
  { changes: "Container stops growing at 1536", name: "2xl", px: 1536 },
] as const satisfies readonly BreakpointSpec[];

export const documentGridSpec = {
  columns: 12,
  containerClasses: [
    "mx-auto",
    "w-full",
    "max-w-screen-2xl",
    "px-4",
    "md:px-8",
  ],
  contentSpan: 8,
  dossierSpan: 4,
  gutter: "gap-x-6",
  sectionGap: "gap-16",
} as const;

export interface AgentMotionSpec {
  jp: string;
  label: string;
  value: string;
}

export const agentMotionSpecs = [
  { jp: "遷移", label: "Clip crossfade", value: "0.38 s" },
  { jp: "場面", label: "Scene loop", value: "8 s" },
  { jp: "反応", label: "Hover reaction", value: "Shuffled deck of 8" },
  { jp: "配慮", label: "Reduced motion", value: "Held key pose" },
] as const satisfies readonly AgentMotionSpec[];
