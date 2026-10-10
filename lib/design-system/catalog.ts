import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import type { CalloutTone } from "@/components/content/callout";
import type { specimenVariants } from "@/components/profile/specimen-variants";
import type { CornerMarks } from "@/components/site/corner-marks";
import type { technicalButtonVariants } from "@/components/site/styles";
import type { badgeVariants } from "@/components/ui/badge";
import type { buttonVariants } from "@/components/ui/button";
import type { tabsListVariants } from "@/components/ui/tabs";
import type { toggleVariants } from "@/components/ui/toggle";

export interface VariantValue {
  name: string;
  note: string;
}

export interface VariantAxis {
  axis: string;
  values: readonly VariantValue[];
}

export type ComponentKind = "component" | "pattern" | "style";

export const primitiveIds = [
  "button",
  "badge",
  "tabs",
  "toggle-group",
  "switch",
  "slider",
  "input",
  "tooltip",
  "separator",
  "kbd",
] as const;

export type PrimitiveId = (typeof primitiveIds)[number];

export const siteComponentIds = [
  "panel-heading",
  "document-section",
  "document-shell",
  "document-hero",
  "page-aside",
  "dossier-panel",
  "corner-marks",
  "leader-list",
  "technical-button",
  "chip",
  "specimen-card",
  "sample-badge",
  "callout",
  "module",
  "redacted-block",
  "barcode",
] as const;

export type SiteComponentId = (typeof siteComponentIds)[number];

export interface ComponentSpec<Id extends string = string> {
  description: string;
  exports: readonly string[];
  file: string;
  id: Id;
  jp: string;
  kind: ComponentKind;
  name: string;
  needles: readonly string[];
  usage: string;
  variants: readonly VariantAxis[];
}

const axisOf = <Name extends string>(
  axis: string,
  notes: Record<Name, string>
): VariantAxis => ({
  axis,
  values: Object.entries<string>(notes).map(([name, note]) => ({ name, note })),
});

const buttonVariantAxis = axisOf<
  NonNullable<VariantProps<typeof buttonVariants>["variant"]>
>("variant", {
  default: "Primary action. Ink fill.",
  destructive: "Irreversible action. Tinted destructive.",
  ghost: "Quiet action inside dense rows.",
  link: "Inline text action.",
  outline: "Secondary action. Hairline border.",
  secondary: "Paper-deep fill.",
});

const buttonSizeAxis = axisOf<
  NonNullable<VariantProps<typeof buttonVariants>["size"]>
>("size", {
  default: "32px high",
  icon: "32px square",
  "icon-lg": "36px square",
  "icon-sm": "28px square",
  "icon-xs": "24px square",
  lg: "36px high",
  sm: "28px high",
  xs: "24px high",
});

const badgeVariantAxis = axisOf<
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
>("variant", {
  default: "Ink fill",
  destructive: "Blocked or invalid",
  ghost: "No fill until hover",
  link: "Inline link",
  outline: "Hairline border",
  secondary: "Paper-deep fill",
});

const tabsListVariantAxis = axisOf<
  NonNullable<VariantProps<typeof tabsListVariants>["variant"]>
>("variant", {
  default: "Muted track with a raised active tab",
  line: "Transparent track with an underline on the active tab",
});

const toggleVariantAxis = axisOf<
  NonNullable<VariantProps<typeof toggleVariants>["variant"]>
>("variant", {
  default: "Transparent until pressed",
  outline: "Hairline border",
});

const toggleSizeAxis = axisOf<
  NonNullable<VariantProps<typeof toggleVariants>["size"]>
>("size", {
  default: "32px high",
  lg: "36px high",
  sm: "28px high",
});

const technicalToneAxis = axisOf<
  NonNullable<VariantProps<typeof technicalButtonVariants>["tone"]>
>("tone", {
  outline: "Hairline border, inverts to ink on hover",
  selected: "Graphite fill for the current choice",
  solid: "Ink fill, inverts to paper on hover",
});

const technicalSizeAxis = axisOf<
  NonNullable<VariantProps<typeof technicalButtonVariants>["size"]>
>("size", {
  md: "44px minimum height",
  sm: "32px high with an extended hit area",
});

const specimenSurfaceAxis = axisOf<
  NonNullable<VariantProps<typeof specimenVariants>["surface"]>
>("surface", {
  deep: "Paper-deep wash",
  hatch: "Diagonal hatch fill",
  plain: "Paper",
});

const cornerRevealAxis = axisOf<
  NonNullable<ComponentProps<typeof CornerMarks>["reveal"]>
>("reveal", {
  always: "Marks always visible",
  hover: "Marks fade in on hover or focus inside a group/marks parent",
});

const calloutToneAxis = axisOf<CalloutTone>("tone", {
  note: "Plain note",
  sample: "Dashed frame for placeholder content",
  tip: "Hint",
  warning: "Hatch fill with corner marks",
});

const noVariants: readonly VariantAxis[] = [];

const component = (
  spec: Omit<ComponentSpec<PrimitiveId>, "kind" | "needles">
): ComponentSpec<PrimitiveId> => ({ ...spec, kind: "component", needles: [] });

export const primitiveSpecs: readonly ComponentSpec<PrimitiveId>[] = [
  component({
    description: "Action. Ink fill by default, outline for secondary actions.",
    exports: ["Button", "buttonVariants"],
    file: "components/ui/button.tsx",
    id: "button",
    jp: "ボタン",
    name: "Button",
    usage: '<Button variant="outline" size="sm">Copy</Button>',
    variants: [buttonVariantAxis, buttonSizeAxis],
  }),
  component({
    description: "Compact status or category mark.",
    exports: ["Badge", "badgeVariants"],
    file: "components/ui/badge.tsx",
    id: "badge",
    jp: "バッジ",
    name: "Badge",
    usage: '<Badge variant="outline">Sample</Badge>',
    variants: [badgeVariantAxis],
  }),
  component({
    description:
      "Switch between views. The line variant matches document chrome.",
    exports: [
      "Tabs",
      "TabsList",
      "TabsTrigger",
      "TabsContent",
      "tabsListVariants",
    ],
    file: "components/ui/tabs.tsx",
    id: "tabs",
    jp: "タブ",
    name: "Tabs",
    usage: `<Tabs defaultValue="preview">
  <TabsList variant="line">
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="code">Code</TabsTrigger>
  </TabsList>
  <TabsContent value="preview">Preview</TabsContent>
  <TabsContent value="code">Code</TabsContent>
</Tabs>`,
    variants: [tabsListVariantAxis],
  }),
  component({
    description: "Pressable choices that share one value.",
    exports: ["ToggleGroup", "ToggleGroupItem"],
    file: "components/ui/toggle-group.tsx",
    id: "toggle-group",
    jp: "トグル群",
    name: "ToggleGroup",
    usage: `<ToggleGroup defaultValue={["grid"]} variant="outline">
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
  <ToggleGroupItem value="list">List</ToggleGroupItem>
</ToggleGroup>`,
    variants: [toggleVariantAxis, toggleSizeAxis],
  }),
  component({
    description: "Binary setting that applies immediately.",
    exports: ["Switch"],
    file: "components/ui/switch.tsx",
    id: "switch",
    jp: "スイッチ",
    name: "Switch",
    usage: '<Switch defaultChecked size="sm" aria-label="Reduced motion" />',
    variants: [
      axisOf<"default" | "sm">("size", {
        default: "32 by 18px track",
        sm: "24 by 14px track",
      }),
    ],
  }),
  component({
    description: "Pick a value on a range.",
    exports: ["Slider"],
    file: "components/ui/slider.tsx",
    id: "slider",
    jp: "スライダー",
    name: "Slider",
    usage: '<Slider defaultValue={[40]} max={100} aria-label="Density" />',
    variants: noVariants,
  }),
  component({
    description: "Single-line text field with a hairline border.",
    exports: ["Input"],
    file: "components/ui/input.tsx",
    id: "input",
    jp: "入力",
    name: "Input",
    usage: '<Input placeholder="Search tokens" aria-label="Search tokens" />',
    variants: noVariants,
  }),
  component({
    description: "Short hint on hover and focus. Ink popup with an arrow.",
    exports: ["Tooltip", "TooltipTrigger", "TooltipContent", "TooltipProvider"],
    file: "components/ui/tooltip.tsx",
    id: "tooltip",
    jp: "ヒント",
    name: "Tooltip",
    usage: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline" />}>Hover</TooltipTrigger>
    <TooltipContent>Label</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    variants: noVariants,
  }),
  component({
    description: "One-pixel divider in the border token.",
    exports: ["Separator"],
    file: "components/ui/separator.tsx",
    id: "separator",
    jp: "区切り",
    name: "Separator",
    usage: '<Separator orientation="vertical" />',
    variants: noVariants,
  }),
  component({
    description: "Keyboard key cap.",
    exports: ["Kbd", "KbdGroup"],
    file: "components/ui/kbd.tsx",
    id: "kbd",
    jp: "キー",
    name: "Kbd",
    usage: "<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>",
    variants: noVariants,
  }),
];

export const otherPrimitiveFiles = [
  "alert",
  "card",
  "command",
  "dialog",
  "empty",
  "input-group",
  "scroll-area",
  "select",
  "sheet",
  "skeleton",
  "table",
  "textarea",
  "toggle",
] as const;

const siteComponent = (
  spec: Omit<ComponentSpec<SiteComponentId>, "kind" | "needles"> & {
    kind?: ComponentKind;
    needles?: readonly string[];
  }
): ComponentSpec<SiteComponentId> => ({
  kind: "component",
  needles: [],
  ...spec,
});

export const siteComponentSpecs: readonly ComponentSpec<SiteComponentId>[] = [
  siteComponent({
    description:
      "Numbered panel heading with a jp annotation, dotted leader and aside.",
    exports: ["PanelHeading"],
    file: "components/site/panel-heading.tsx",
    id: "panel-heading",
    jp: "見出し",
    name: "PanelHeading",
    usage:
      '<PanelHeading index="DS-01" label="Philosophy" jp="哲学" aside="07 rules" />',
    variants: noVariants,
  }),
  siteComponent({
    description:
      "A numbered section: PanelHeading plus content, with an optional agent waypoint.",
    exports: ["DocumentSection", "PanelCount"],
    file: "components/site/document-section.tsx",
    id: "document-section",
    jp: "節",
    name: "DocumentSection",
    usage: `<DocumentSection id="color" index="DS-02" jp="色彩" label="Color">
  {content}
</DocumentSection>`,
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Persistent frame in app/(document)/layout.tsx. A sticky 4-column dossier with the page aside slot beside an 8-column content stack.",
    exports: ["DocumentShell"],
    file: "components/site/document-shell.tsx",
    id: "document-shell",
    jp: "枠組",
    name: "DocumentShell",
    usage: `<DocumentShell
  aside={aside}
  dossier={<IdentityDossier identity={identity} />}
  handle={identity.login}
  name={identity.name}
>
  {children}
</DocumentShell>`,
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Page header: doc code and meta strip, display title, jp glyph and hazard stripe. Sizes with container queries.",
    exports: ["DocumentHero"],
    file: "components/site/document-hero.tsx",
    id: "document-hero",
    jp: "表紙",
    name: "DocumentHero",
    usage:
      '<DocumentHero code="DS-00" jp="設計" lede="Tokens, parts, motion" meta={[{ label: "Tokens", value: "36" }]} title="Design system" />',
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Left-panel wrapper for a route's @aside slot. Swaps on navigation while the dossier stays mounted.",
    exports: ["PageAside"],
    file: "components/site/page-aside.tsx",
    id: "page-aside",
    jp: "脇",
    name: "PageAside",
    usage: `<PageAside code="DS-00" label="Design system index">
  <DossierPanel collapsible jp="目次" label="On this page">{toc}</DossierPanel>
</PageAside>`,
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Titled panel for the left column. Collapsible below lg, always open from lg.",
    exports: ["DossierPanel"],
    file: "components/site/compact-dossier.tsx",
    id: "dossier-panel",
    jp: "枠",
    name: "DossierPanel",
    usage: `<DossierPanel collapsible jp="絞込" label="Filter">{filters}</DossierPanel>`,
    variants: noVariants,
  }),
  siteComponent({
    description: "Crosshair corner ticks that frame a box.",
    exports: ["CornerMarks"],
    file: "components/site/corner-marks.tsx",
    id: "corner-marks",
    jp: "角印",
    name: "CornerMarks",
    usage:
      '<div className="group/marks relative"><CornerMarks reveal="hover" /></div>',
    variants: [cornerRevealAxis],
  }),
  siteComponent({
    description: "Dotted-leader key and value rows for specs and facts.",
    exports: ["LeaderList", "LeaderRow"],
    file: "components/site/leader-list.tsx",
    id: "leader-list",
    jp: "仕様",
    name: "LeaderList",
    usage: `<LeaderList>
  <LeaderRow jp="役割" label="Role">Frontend engineer</LeaderRow>
</LeaderList>`,
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Technical button recipe. Mono caps, hairline border, ink inversion on hover.",
    exports: ["technicalButtonVariants"],
    file: "components/site/styles.ts",
    id: "technical-button",
    jp: "技術釦",
    kind: "style",
    name: "technicalButtonVariants",
    usage:
      '<button className={technicalButtonVariants({ size: "sm", tone: "solid" })} type="button">Copy</button>',
    variants: [technicalToneAxis, technicalSizeAxis],
  }),
  siteComponent({
    description: "Filter chip recipe. Pressed state inverts to ink.",
    exports: ["chipClassName"],
    file: "components/site/styles.ts",
    id: "chip",
    jp: "札",
    kind: "style",
    name: "chipClassName",
    usage:
      '<button aria-pressed className={chipClassName} type="button">Motion</button>',
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Specimen card recipe. Hairline right and bottom borders for gridded cells.",
    exports: ["specimenVariants"],
    file: "components/profile/specimen-variants.ts",
    id: "specimen-card",
    jp: "見本",
    kind: "style",
    name: "specimenVariants",
    usage:
      '<li className={specimenVariants({ interactive: true, surface: "hatch" })}>{content}</li>',
    variants: [specimenSurfaceAxis],
  }),
  siteComponent({
    description:
      "Marks placeholder content. Every invented entry carries it until replaced.",
    exports: ["SampleBadge"],
    file: "components/content/sample-badge.tsx",
    id: "sample-badge",
    jp: "見本",
    name: "SampleBadge",
    usage: '<SampleBadge source="lib/site/practice.ts" />',
    variants: noVariants,
  }),
  siteComponent({
    description: "Boxed aside for notes, tips, sample content and warnings.",
    exports: ["Callout"],
    file: "components/content/callout.tsx",
    id: "callout",
    jp: "注記",
    name: "Callout",
    usage: '<Callout tone="warning" title="Watch out">Text</Callout>',
    variants: [calloutToneAxis],
  }),
  siteComponent({
    description:
      "Module frame with a corner tick, id, title and jp annotation.",
    exports: ["Module", "TickMark"],
    file: "components/profile/module.tsx",
    id: "module",
    jp: "枠",
    name: "Module",
    usage: '<Module id="M-01" jp="見本" title="Specimen">{content}</Module>',
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Withheld content. Dashed hatch block with a graphite stamp. Used where details stay private.",
    exports: [],
    file: "components/profile/activity-timeline.tsx",
    id: "redacted-block",
    jp: "秘匿",
    kind: "pattern",
    name: "REDACTED block",
    needles: ["hatch", "border-dashed", "Redacted"],
    usage: `<div className="border-rule-strong hatch flex items-center justify-between gap-4 border border-dashed p-4">
  <p className="label text-graphite">Details are withheld</p>
  <span className="border-graphite bg-graphite text-paper inline-flex min-h-11 flex-col items-center justify-center border-2 px-3 py-1">
    <span className="jp text-sm leading-tight">秘匿</span>
    <span className="label leading-tight">Redacted</span>
  </span>
</div>`,
    variants: noVariants,
  }),
  siteComponent({
    description:
      "Seeded barcode strip over a label row. Bars come from seededRandom(hashText(id)) in components/profile/seeded.ts.",
    exports: [],
    file: "components/profile/identity-dossier.tsx",
    id: "barcode",
    jp: "符号",
    kind: "pattern",
    name: "Barcode",
    needles: ["preserveAspectRatio", "seededRandom", "hashText"],
    usage: `<svg aria-hidden className="text-ink h-10 w-full" fill="currentColor" preserveAspectRatio="none" viewBox={\`0 0 \${total} 24\`}>
  {bars.map((bar) => (
    <rect height={24} key={bar.x} width={bar.width} x={bar.x} y={0} />
  ))}
</svg>
<p className="label text-ink flex justify-between"><span>DS-00</span><span>{code}</span></p>`,
    variants: noVariants,
  }),
];

export const allComponentSpecs: readonly ComponentSpec[] = [
  ...primitiveSpecs,
  ...siteComponentSpecs,
];

export const pageRecipe = `app/(document)/<route>/page.tsx
<>
  <DocumentHero code="XX-01" jp="日本語" title="Title" />
  <DocumentSection id="first" index="XX-03" jp="日本語" label="First">
    {content}
  </DocumentSection>
</>

app/(document)/@aside/<route>/page.tsx
<PageAside code="XX-02" label="Panel label">
  <DossierPanel collapsible jp="目次" label="On this page">
    <TableOfContents headings={headings} />
  </DossierPanel>
</PageAside>`;
