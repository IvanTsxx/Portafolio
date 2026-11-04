export const colorGroups = [
  "surface",
  "text",
  "line",
  "state",
  "code",
  "alias",
] as const;

export type ColorGroup = (typeof colorGroups)[number];

export type ColorUtilityPrefix = "bg" | "border" | "outline" | "text";

export interface ColorSpec {
  group: ColorGroup;
  name: string;
  on?: string;
  prefix: ColorUtilityPrefix | null;
  role: string;
}

export const colorGroupLabels = {
  alias: "shadcn aliases",
  code: "Code syntax",
  line: "Line",
  state: "State",
  surface: "Surface",
  text: "Text",
} as const satisfies Record<ColorGroup, string>;

export const colorSpecs: readonly ColorSpec[] = [
  { group: "surface", name: "background", prefix: "bg", role: "Page ground" },
  {
    group: "surface",
    name: "surface",
    prefix: "bg",
    role: "Panels, hover rows, poster ground",
  },
  {
    group: "surface",
    name: "popover",
    prefix: "bg",
    role: "Stages, code and figure grounds, dialogs",
  },
  { group: "text", name: "foreground", prefix: "text", role: "Text and fills" },
  {
    group: "text",
    name: "muted-foreground",
    prefix: "text",
    role: "Secondary text",
  },
  {
    group: "text",
    name: "faint",
    prefix: "text",
    role: "Indices, captions, metadata",
  },
  { group: "line", name: "border", prefix: "border", role: "Hairlines" },
  {
    group: "line",
    name: "border-strong",
    prefix: "border",
    role: "Frames, rules, leaders",
  },
  {
    group: "state",
    name: "signal",
    prefix: "text",
    role: "Active and live, never a large fill",
  },
  { group: "state", name: "focus", prefix: "outline", role: "Focus outline" },
  { group: "state", name: "destructive", prefix: "text", role: "Errors" },
  { group: "code", name: "code", prefix: "bg", role: "Code ground" },
  {
    group: "code",
    name: "code-foreground",
    on: "code",
    prefix: null,
    role: "Text, variables",
  },
  {
    group: "code",
    name: "code-comment",
    on: "code",
    prefix: null,
    role: "Comments",
  },
  {
    group: "code",
    name: "code-punctuation",
    on: "code",
    prefix: null,
    role: "Punctuation",
  },
  {
    group: "code",
    name: "code-property",
    on: "code",
    prefix: null,
    role: "Properties",
  },
  {
    group: "code",
    name: "code-keyword",
    on: "code",
    prefix: "text",
    role: "Keywords, inline code",
  },
  {
    group: "code",
    name: "code-string",
    on: "code",
    prefix: null,
    role: "Strings",
  },
  {
    group: "code",
    name: "code-constant",
    on: "code",
    prefix: null,
    role: "Constants",
  },
  {
    group: "code",
    name: "code-type",
    on: "code",
    prefix: null,
    role: "Types",
  },
  {
    group: "alias",
    name: "popover-foreground",
    on: "popover",
    prefix: "text",
    role: "Text on popovers",
  },
  { group: "alias", name: "primary", prefix: "bg", role: "Solid actions" },
  {
    group: "alias",
    name: "primary-foreground",
    on: "primary",
    prefix: "text",
    role: "Text on solid actions",
  },
  { group: "alias", name: "secondary", prefix: "bg", role: "Quiet fills" },
  {
    group: "alias",
    name: "secondary-foreground",
    on: "secondary",
    prefix: "text",
    role: "Text on quiet fills",
  },
  { group: "alias", name: "muted", prefix: "bg", role: "Muted fills" },
  { group: "alias", name: "accent", prefix: "bg", role: "Hover fills" },
  { group: "alias", name: "input", prefix: "border", role: "Input border" },
  { group: "alias", name: "ring", prefix: "outline", role: "Focus ring" },
];

export const defaultContrastGround = "background";

export interface EasingSpec {
  name: string;
  use: string;
}

export const easingSpecs = [
  { name: "mechanical", use: "State flips and links" },
  { name: "out-quart", use: "Buttons and small fades" },
  { name: "out-expo", use: "Reveals, arrows and settles" },
  { name: "in-out-cinema", use: "Long strokes and wipes" },
] as const satisfies readonly EasingSpec[];

export type EasingName = (typeof easingSpecs)[number]["name"];

export interface DurationSpec {
  className: string;
  ms: number;
  use: string;
}

export const durationSpecs = [
  { className: "duration-100", ms: 100, use: "State flips" },
  { className: "duration-200", ms: 200, use: "Buttons and color shifts" },
  { className: "duration-300", ms: 300, use: "Arrow nudges and hovers" },
  { className: "duration-500", ms: 500, use: "Larger moves" },
] as const satisfies readonly DurationSpec[];

export interface FontFamilySpec {
  className: string;
  cssVar: string;
  name: string;
  role: string;
  sample: string;
  sourceVar: string;
}

export const fontFamilySpecs = [
  {
    className: "font-signature",
    cssVar: "--font-signature",
    name: "Herr Von Muellerhoff",
    role: "The signature only",
    sample: "Ivan",
    sourceVar: "--font-signature-script",
  },
  {
    className: "font-serif",
    cssVar: "--font-serif",
    name: "Instrument Serif",
    role: "Titles and moments",
    sample: "Code, Design, Explore",
    sourceVar: "--font-instrument-serif",
  },
  {
    className: "font-sans",
    cssVar: "--font-sans",
    name: "Geist",
    role: "Reading and interface",
    sample: "Quiet interface, expressive artifacts",
    sourceVar: "--font-geist-sans",
  },
  {
    className: "font-mono",
    cssVar: "--font-mono",
    name: "Geist Mono",
    role: "Labels, indexes, readouts, code",
    sample: "LAB-01 · 0123 · R3F",
    sourceVar: "--font-geist-mono",
  },
] as const satisfies readonly FontFamilySpec[];

export type FontClassName = (typeof fontFamilySpecs)[number]["className"];

export const fontAliasNames = ["heading"] as const;

export interface TypeTokenSpec {
  className: string;
  name: string;
  sample: string;
  use: string;
}

export const typeTokenSpecs = [
  {
    className: "display text-hero",
    name: "hero",
    sample: "Code, Design",
    use: "Page titles",
  },
  {
    className: "display text-display",
    name: "display",
    sample: "Explore",
    use: "Section titles",
  },
  {
    className: "display text-title",
    name: "title",
    sample: "Precision in motion",
    use: "Detail titles",
  },
] as const satisfies readonly TypeTokenSpec[];

export type TypeTokenName = (typeof typeTokenSpecs)[number]["name"];

export interface TypeStepSpec {
  className: string;
  sample: string;
  size: string;
  use: string;
}

export const typeStepSpecs = [
  {
    className: "text-base",
    sample: "Body copy in Geist.",
    size: "16",
    use: "Reading text",
  },
  {
    className: "text-muted-foreground text-sm",
    sample: "Secondary copy in muted foreground.",
    size: "14",
    use: "Summaries",
  },
  {
    className: "label",
    sample: "Label 0123",
    size: "11",
    use: "Mono labels and metadata",
  },
  {
    className: "spaced",
    sample: "Spaced caps",
    size: "12",
    use: "Eyebrows",
  },
] as const satisfies readonly TypeStepSpec[];

export const utilityGroups = ["mark", "layout", "motion"] as const;

export type UtilityGroup = (typeof utilityGroups)[number];

export interface UtilitySpec {
  group: UtilityGroup;
  name: string;
  summary: string;
  variable?: string;
}

export const utilitySpecs = [
  {
    group: "mark",
    name: "hairline-x",
    summary: "1px horizontal rule in the border color.",
  },
  {
    group: "mark",
    name: "grain",
    summary: "Static film noise, overlay blend. 5% light, 7% dark.",
    variable: "--grain-opacity",
  },
  {
    group: "layout",
    name: "max-h-sticky",
    summary:
      "Caps the sticky plate at the viewport minus the header, then scrolls.",
  },
  {
    group: "layout",
    name: "bottom-safe",
    summary:
      "Pins a floating control 16px above the bottom edge, or above the home indicator.",
  },
  {
    group: "layout",
    name: "reading-scope",
    summary: "Shares the --reading timeline with the whole plate page.",
  },
  {
    group: "layout",
    name: "reading-subject",
    summary: "Names the reading column as the --reading view timeline.",
  },
  {
    group: "motion",
    name: "equalizer-bar",
    summary:
      "One bar of the now-playing equalizer, 900ms loop. Offset with wait-*.",
    variable: "--delay",
  },
  {
    group: "motion",
    name: "guide-draw",
    summary: "A guide line draws down from the top, 1400ms in-out-cinema.",
    variable: "--delay",
  },
  {
    group: "mark",
    name: "guide-glow",
    summary:
      "Brightens a guide's two rules in a 12rem radius around the pointer, from the Guides level up. Off under reduced motion.",
    variable: "--guide-x · --guide-y · --guide-near",
  },
  {
    group: "motion",
    name: "signature-write",
    summary: "The signature writes left to right as it scrolls into view.",
  },
  {
    group: "layout",
    name: "grid-leader",
    summary: "Leader row: index, title and description, dotted leader, meta.",
  },
  {
    group: "layout",
    name: "grid-leader-gutter",
    summary: "Leader row with the index pulled into the sheet gutter.",
  },
  {
    group: "mark",
    name: "hatch",
    summary: "Diagonal hairline fill, 6px pitch.",
  },
  {
    group: "mark",
    name: "blueprint-dots",
    summary: "Dot grid, 24px by default.",
    variable: "--grid-size",
  },
  {
    group: "mark",
    name: "hazard-stripe",
    summary: "Diagonal stripes in currentColor, 5px pitch.",
  },
  {
    group: "layout",
    name: "min-h-hero",
    summary: "Viewport height minus 8rem.",
  },
  {
    group: "layout",
    name: "no-scrollbar",
    summary: "Hides the scrollbar, keeps scrolling.",
  },
  {
    group: "layout",
    name: "object-portrait",
    summary: "Crops a portrait around the face, 50% 32%.",
  },
  {
    group: "motion",
    name: "mask-line",
    summary: "Clips a line so mask-up can slide in.",
  },
  {
    group: "motion",
    name: "rise-in",
    summary: "Rises 8px and fades in.",
    variable: "--i · --delay",
  },
  {
    group: "motion",
    name: "mask-up",
    summary: "Slides up out of a clipped line.",
    variable: "--i · --delay",
  },
  {
    group: "motion",
    name: "reveal-on-view",
    summary: "Rises in while entering the viewport. CSS scroll timeline.",
  },
  {
    group: "motion",
    name: "reading-progress-x",
    summary:
      "Fills left to right as the reading column scrolls past. CSS scroll timeline, hidden without support.",
  },
  {
    group: "motion",
    name: "reading-progress-y",
    summary:
      "Fills top to bottom as the reading column scrolls past. CSS scroll timeline, hidden without support.",
  },
  {
    group: "motion",
    name: "draw-in",
    summary: "Stroke draws on. Set pathLength to 1.",
    variable: "--delay",
  },
  {
    group: "motion",
    name: "clip-reveal",
    summary: "Wipes a frame open from the top.",
    variable: "--delay",
  },
  {
    group: "motion",
    name: "settle-in",
    summary: "Scales an image from 108% to rest.",
    variable: "--delay",
  },
  {
    group: "motion",
    name: "pop-in",
    summary: "Overshoot pop for a confirmed action.",
  },
  {
    group: "motion",
    name: "burst-dot",
    summary: "A dot flies out and fades. Rotate its wrapper.",
  },
  {
    group: "motion",
    name: "count-roll",
    summary: "A new number rolls up into place. Key it by value.",
  },
  {
    group: "motion",
    name: "ink-underline",
    summary: "Underline draws in on hover or focus.",
  },
  {
    group: "motion",
    name: "wait-*",
    summary: "Delays an animation by N ms.",
    variable: "--delay",
  },
] as const satisfies readonly UtilitySpec[];

export type UtilityName = (typeof utilitySpecs)[number]["name"];

export type UtilityOf<Group extends UtilityGroup> = Extract<
  (typeof utilitySpecs)[number],
  { group: Group }
>;

export const utilitiesIn = <Group extends UtilityGroup>(group: Group) =>
  utilitySpecs.filter((spec): spec is UtilityOf<Group> => spec.group === group);

export const typeUtilityNames = ["display", "label", "spaced"] as const;

export interface SpacingStepSpec {
  px: number;
  step: string;
  use?: string;
}

export const spacingSpecs = [
  { px: 4, step: "1" },
  { px: 8, step: "2" },
  { px: 12, step: "3" },
  { px: 16, step: "4" },
  { px: 20, step: "5", use: "Phone gutter" },
  { px: 24, step: "6" },
  { px: 32, step: "8", use: "Tablet gutter" },
  { px: 40, step: "10" },
  { px: 48, step: "12" },
  { px: 64, step: "16" },
  { px: 96, step: "24", use: "Section gap" },
] as const satisfies readonly SpacingStepSpec[];

export const radiusStepNames = ["sm", "md", "lg", "pill"] as const;

export type RadiusStepName = (typeof radiusStepNames)[number];

export interface ContainerSpec {
  name: string;
  use: string;
}

export const containerSpecs = [
  { name: "frame", use: "Page frame, header, footer" },
] as const satisfies readonly ContainerSpec[];

export type ContainerName = (typeof containerSpecs)[number]["name"];

export const documentGridSpec = {
  containerClasses: ["max-w-frame", "relative", "mx-auto"],
  gutters: ["px-5", "md:px-8"],
  measure: { className: "max-w-prose", width: "65ch" },
  sectionGap: "gap-24",
} as const;

export const stepPx = (className: string) =>
  Number(className.slice(className.lastIndexOf("-") + 1)) * 4;

export interface ComponentSpec {
  file: string;
  name: string;
  summary: string;
  symbol: string;
}

export const componentSpecs = [
  {
    file: "components/site/panel-heading.tsx",
    name: "Panel heading",
    summary: "Mono index, label, hairline leader, aside.",
    symbol: "PanelHeading",
  },
  {
    file: "components/site/document-hero.tsx",
    name: "Document hero",
    summary:
      "Mono code row, serif title that masks up, lede, closing hairline.",
    symbol: "DocumentHero",
  },
  {
    file: "components/site/styles.ts",
    name: "Button",
    summary: "Outline, solid and selected tones, one size scale.",
    symbol: "technicalButtonVariants",
  },
  {
    file: "components/site/styles.ts",
    name: "Chip",
    summary: "Framed filter. Pressed chips invert.",
    symbol: "chipClassName",
  },
  {
    file: "components/site/styles.ts",
    name: "Link",
    summary: "Dotted underline turns solid on hover.",
    symbol: "linkClassName",
  },
  {
    file: "components/site/styles.ts",
    name: "Hover row",
    summary: "Surface wash on hover, outline for keyboard focus.",
    symbol: "hoverRowClassName",
  },
  {
    file: "components/site/corner-marks.tsx",
    name: "Corner marks",
    summary: "Four guide marks. Always on, or shown on hover and focus.",
    symbol: "CornerMarks",
  },
  {
    file: "components/site/theme-toggle.tsx",
    name: "Theme toggle",
    summary: "Half-filled circle, system first, choice persists.",
    symbol: "ThemeToggle",
  },
  {
    file: "components/registry-docs/command-line.tsx",
    name: "Copy command",
    summary: "Install command with a copy button.",
    symbol: "CommandLine",
  },
  {
    file: "components/content/code-figure.tsx",
    name: "Code block",
    summary: "Syntax-highlighted source on the code ground.",
    symbol: "CodeFigure",
  },
  {
    file: "components/lab/experiment-card.tsx",
    name: "Experiment card",
    summary: "Static poster, mono index, serif title.",
    symbol: "ExperimentCard",
  },
  {
    file: "components/lab/experiment-stage.tsx",
    name: "Demo stage",
    summary: "Framed stage with corner marks, status line and controls.",
    symbol: "ExperimentStage",
  },
  {
    file: "components/site/open-in-menu.tsx",
    name: "Open in menu",
    summary: "Copies the page Markdown or opens it in an assistant.",
    symbol: "OpenInMenu",
  },
] as const satisfies readonly ComponentSpec[];
