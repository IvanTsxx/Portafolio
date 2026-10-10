import { siteConfig } from "@/lib/site/config";

import {
  agentActionNames,
  agentContract,
  agentReactionNames,
  agentRoleSpecs,
  agentSceneSpecs,
  agentUsage,
} from "./agents";
import {
  allComponentSpecs,
  primitiveSpecs,
  siteComponentSpecs,
} from "./catalog";
import type { ComponentSpec } from "./catalog";
import type { ContrastGrade } from "./color";
import type { ColorToken, DesignSystem } from "./model";
import { guidance, principles } from "./philosophy";
import { rawMarkdownPath, sectionById } from "./sections";
import type { SectionId } from "./sections";
import {
  agentMotionSpecs,
  breakpointSpecs,
  colorGroupLabels,
  colorGroups,
  documentGridSpec,
  spacingSpecs,
  typeScaleSpecs,
} from "./specs";

const escapeCell = (cell: string) => cell.replaceAll("|", String.raw`\|`);

const table = (
  headers: readonly string[],
  rows: readonly (readonly string[])[]
) =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");

const code = (value: string) => `\`${value}\``;

const fence = (language: string, body: string) =>
  `\`\`\`${language}\n${body}\n\`\`\``;

const bullets = (items: readonly string[]) =>
  items.map((item) => `- ${item}`).join("\n");

const sectionHeading = (id: SectionId) => {
  const section = sectionById(id);
  return `## ${section.index} ${section.label} ${section.jp}`;
};

const gradeLabels = {
  AA: "AA",
  "AA-large": "AA large",
  AAA: "AAA",
  "non-text": "non-text",
} as const satisfies Record<ContrastGrade, string>;

const contrastCell = (token: ColorToken) => {
  if (token.name === "paper") {
    return "base";
  }
  const grade = `${token.contrast.toFixed(1)}:1 ${gradeLabels[token.grade]}`;
  return token.against === "paper" ? grade : `${grade} on ${token.against}`;
};

const colorRow = (token: ColorToken) => [
  code(token.name),
  code(token.tailwind),
  code(token.cssVar),
  token.alias ? code(token.alias) : "",
  code(token.oklch),
  code(token.hex),
  contrastCell(token),
  token.role,
];

const importPath = (file: string) => `@/${file.replace(/\.tsx?$/u, "")}`;

const philosophy = () => [
  sectionHeading("philosophy"),
  principles
    .map(
      (principle, index) =>
        `${index + 1}. **${principle.title}** ${principle.jp}. ${principle.rule}`
    )
    .join("\n"),
];

const color = (system: DesignSystem) => [
  sectionHeading("color"),
  "Every color is a CSS variable declared in `:root` of `app/globals.css` and exposed to Tailwind through `@theme inline` as `--color-*`. Values are OKLCH. Hex is the sRGB equivalent. Contrast is WCAG 2.x against `--paper` unless the row says `on <token>`, with translucent tokens composited over paper first. Grades: AAA from 7, AA from 4.5, AA large from 3, non-text below 3 (decorative only, never body text).",
  ...colorGroups.flatMap((group) => {
    const tokens = system.colors.filter((token) => token.group === group);
    const { jp, label } = colorGroupLabels[group];
    return [
      `### ${label} ${jp}`,
      table(
        [
          "Token",
          "Tailwind",
          "CSS variable",
          "Alias of",
          "OKLCH",
          "Hex",
          "Contrast",
          "Role",
        ],
        tokens.map(colorRow)
      ),
    ];
  }),
];

const typography = (system: DesignSystem) => [
  sectionHeading("typography"),
  "### Families",
  table(
    ["Class", "Family", "Variable", "Weights", "Role"],
    system.fonts.map((font) => [
      code(font.className),
      font.name,
      code(font.cssVar),
      font.weights,
      font.role,
    ])
  ),
  `Fonts load through ${code("lib/fonts.ts")} (next/font) into ${system.fonts.map((font) => code(font.sourceVar)).join(", ")}, which ${code("@theme inline")} maps to the ${code("--font-*")} variables above. ${code("font-heading")} and ${code("font-display")} alias ${code("font-sans")}.`,
  "### Scale",
  table(
    ["Classes", "Size px", "Use"],
    typeScaleSpecs.map((step) => [code(step.className), step.size, step.use])
  ),
  `The ${code("label")} utility is the annotation style (see utilities). Pair every section label with a ${code("jp")} annotation. The theme also defines a ${code(system.textLabel.className)} step: ${system.textLabel.size}, line height ${system.textLabel.lineHeight}, tracking ${system.textLabel.letterSpacing}.`,
];

const spacing = (system: DesignSystem) => [
  sectionHeading("spacing"),
  "### Spacing",
  "Tailwind's 4px scale (`--spacing: 0.25rem`). Spacing, sizes and positions are multiples of 4px.",
  table(
    ["Step", "Example class", "Px", "Use"],
    spacingSpecs.map((step) => [
      step.step,
      code(`p-${step.step}`),
      String(step.px),
      step.use,
    ])
  ),
  "### Radius",
  `Radius is ${code(`${system.radius.baseVar}: ${system.radius.base}`)}. Every step derives from it, so every corner is square.`,
  table(
    ["Class", "Variable", "Factor", "Px"],
    system.radius.steps.map((step) => [
      code(step.className),
      code(step.cssVar),
      String(step.factor),
      String(step.px),
    ])
  ),
  "### Document grid",
  bullets([
    `Container: ${code(documentGridSpec.container)}.`,
    `${documentGridSpec.columns} columns from lg. Dossier spans ${documentGridSpec.dossierSpan} and is sticky. Content spans ${documentGridSpec.contentSpan}.`,
    `Column gutter ${code(documentGridSpec.gutter)}. Sections stack with ${code(documentGridSpec.sectionGap)}. Panels stack with ${code("gap-6")}.`,
    "Cells use hairline right and bottom borders inside a container with top and left borders.",
  ]),
  "### Breakpoints",
  table(
    ["Name", "Min width px", "What changes"],
    breakpointSpecs.map((breakpoint) => [
      code(breakpoint.name),
      String(breakpoint.px),
      breakpoint.changes,
    ])
  ),
];

const utilities = (system: DesignSystem) => [
  sectionHeading("utilities"),
  "Utilities are defined once with `@utility` in `app/globals.css`. Use them in markup. Do not write ad-hoc CSS classes.",
  ...system.utilities.flatMap((utility) => [
    `### ${code(utility.name)}`,
    utility.summary,
    fence("tsx", utility.usage),
    fence("css", utility.css),
  ]),
];

const variantTables = (spec: ComponentSpec) =>
  spec.variants.flatMap((axis) => [
    `Variant axis ${code(axis.axis)}:`,
    table(
      ["Value", "Meaning"],
      axis.values.map((value) => [code(value.name), value.note])
    ),
  ]);

const componentBlock = (spec: ComponentSpec) => [
  `### ${spec.name} ${spec.jp}`,
  spec.description,
  spec.kind === "pattern"
    ? `Pattern. Reference: ${code(spec.file)}.`
    : `Import: ${code(`import { ${spec.exports.join(", ")} } from "${importPath(spec.file)}"`)}`,
  ...variantTables(spec),
  fence("tsx", spec.usage),
];

const primitives = () => [
  sectionHeading("primitives"),
  "shadcn base-lyra primitives on Base UI in `components/ui`, restyled by tokens: radius 0, ink fills, hairline borders. Compose them; do not fork them.",
  ...primitiveSpecs.flatMap(componentBlock),
];

const siteComponents = () => [
  sectionHeading("components"),
  "Site-level parts in `components/site`, `components/profile` and `components/content`. Compose pages from `DocumentLayout`, `DocumentHero` and `DocumentSection`.",
  ...siteComponentSpecs.flatMap(componentBlock),
];

const motion = (system: DesignSystem) => [
  sectionHeading("motion"),
  "### Easings",
  "Declared in `@theme inline`, available as `ease-*` utilities.",
  table(
    ["Token", "Class", "Curve", "Use"],
    system.easings.map((easing) => [
      code(easing.cssVar),
      code(easing.className),
      code(easing.curve),
      easing.use,
    ])
  ),
  "### Durations",
  "Tailwind duration utilities. Hover, focus and press flip in 100ms.",
  table(
    ["Name", "Class", "Ms", "Ease", "Use"],
    system.durations.map((duration) => [
      duration.name,
      code(duration.className),
      String(duration.ms),
      code(`ease-${duration.ease}`),
      duration.use,
    ])
  ),
  "### Rules",
  bullets([
    "Animate transform, opacity, color and clip-path. Do not animate layout properties.",
    "Hover and focus effects are CSS only. Gate hover-only inversions with `pointer-fine:` so touch never sticks.",
    "Every animation ships with a reduced-motion twin. The global rule below collapses all CSS durations; JavaScript motion branches on `useReducedMotion` from `hooks/use-reduced-motion`.",
    "GSAP comes from `motionKit` in `lib/motion/gsap.ts`.",
    `Agent motion: ${agentMotionSpecs.map((spec) => `${spec.label.toLowerCase()} ${spec.value.toLowerCase()}`).join("; ")}.`,
  ]),
  fence("css", system.reducedMotionCss),
];

const agents = () => [
  sectionHeading("agents"),
  "### Contract",
  bullets(agentContract),
  "### Roles",
  table(
    ["Designation", "Role", "Kit", "Signature actions", "Responsibilities"],
    agentRoleSpecs.map((profile) => [
      profile.designation,
      `${code(profile.role)} ${profile.title}`,
      profile.kit.join(", "),
      profile.signatureActions.join(", "),
      profile.responsibilities.join("; "),
    ])
  ),
  "### Actions",
  agentActionNames.map(code).join(" "),
  "### Hover reactions",
  agentReactionNames.map(code).join(" "),
  "### Scenes",
  table(
    ["Code", "Scene", "Id", "Cast"],
    agentSceneSpecs.map((scene) => [
      scene.code,
      scene.label,
      code(scene.id),
      scene.cast.join(", "),
    ])
  ),
  "### Usage",
  fence("tsx", agentUsage.join("\n")),
];

const rules = () => [
  "## Do and do not",
  "### Do",
  bullets(guidance.do),
  "### Do not",
  bullets(guidance.dont),
];

export const renderDesignMarkdown = (system: DesignSystem) =>
  `${[
    `# ${siteConfig.name} design system`,
    `Design system of ${siteConfig.name}'s portfolio (${siteConfig.url}). A technical document on paper: ink on paper, with small orange 3D agents as the only color.`,
    `Live reference: /design-system. Raw markdown: ${rawMarkdownPath}. Generated by ${code("bun run design:md")} from ${code("app/globals.css")} and typed data in ${code("lib/design-system/")}. Do not edit by hand.`,
    `${allComponentSpecs.length} documented components, ${system.colors.length} color tokens, ${system.utilities.length} utilities.`,
    ...philosophy(),
    ...color(system),
    ...typography(system),
    ...spacing(system),
    ...utilities(system),
    ...primitives(),
    ...siteComponents(),
    ...motion(system),
    ...agents(),
    ...rules(),
  ].join("\n\n")}\n`;
