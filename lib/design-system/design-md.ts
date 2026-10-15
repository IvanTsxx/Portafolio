import { siteConfig } from "@/lib/site/config";

import type { ColorToken, DesignSystem } from "./model";
import { guidance, principles } from "./philosophy";
import {
  colorGroupLabels,
  componentMotionSpecs,
  componentSpecs,
  spacingSpecs,
} from "./specs";
import type { ColorGroup } from "./specs";

const quote = (value: string) => JSON.stringify(value);

const yamlMap = (
  key: string,
  entries: readonly (readonly [string, string])[]
) => [
  `${key}:`,
  ...entries.map(([name, value]) => `  ${name}: ${quote(value)}`),
];

const paletteGroups = [
  "surface",
  "ink",
  "rule",
  "agent",
  "signal",
] as const satisfies readonly ColorGroup[];

const paletteGroupSet = new Set<ColorGroup>(paletteGroups);

export const paletteColors = (system: DesignSystem) =>
  system.colors.filter(
    (token) => token.alias === null && paletteGroupSet.has(token.group)
  );

const typographyTokens = (system: DesignSystem) => {
  const fontName = (className: string, fallback: string) =>
    system.fonts.find((font) => font.className === className)?.name ?? fallback;
  const sans = fontName("font-sans", "Zen Kaku Gothic New");
  const mono = fontName("font-mono", "Geist Mono");
  return [
    [
      "display",
      {
        fontFamily: sans,
        fontSize: "6rem",
        fontWeight: "300",
        letterSpacing: "-0.05em",
        lineHeight: "0.88",
      },
    ],
    [
      "label",
      {
        fontFamily: mono,
        fontSize: "0.625rem",
        fontWeight: "400",
        letterSpacing: "0.16em",
        lineHeight: "0.875rem",
      },
    ],
  ] as const;
};

const frontMatter = (system: DesignSystem) => [
  "---",
  "version: alpha",
  `name: ${quote(`${siteConfig.nickname} · Paper and ink`)}`,
  `description: ${quote("A dossier on paper. Ink type, hairline rules, numbered panels, one orange 3D companion.")}`,
  ...yamlMap(
    "colors",
    paletteColors(system).map((token) => [token.name, token.hex])
  ),
  "typography:",
  ...typographyTokens(system).flatMap(([name, style]) => [
    `  ${name}:`,
    ...Object.entries(style).map(
      ([property, value]) => `    ${property}: ${quote(value)}`
    ),
  ]),
  ...yamlMap("rounded", [["none", "0px"]]),
  ...yamlMap(
    "spacing",
    spacingSpecs.map((step) => [step.step, `${step.px}px`])
  ),
  "---",
];

const colorGroupLine = (group: ColorGroup, tokens: readonly ColorToken[]) =>
  `- ${colorGroupLabels[group].label}: ${tokens
    .flatMap((token) =>
      token.group === group && token.alias === null
        ? [`\`${token.name}\` (${token.role.toLowerCase()})`]
        : []
    )
    .join(", ")}.`;

const motionLines = (system: DesignSystem) =>
  system.easings.map(
    (easing) =>
      `- \`${easing.className}\`: ${system.durations
        .flatMap((duration) =>
          duration.ease === easing.name
            ? [`${duration.ms}ms ${duration.use.toLowerCase()}`]
            : []
        )
        .join(", ")}.`
  );

export const renderDesignMarkdown = (system: DesignSystem) =>
  [
    ...frontMatter(system),
    "",
    "## Overview",
    "",
    ...principles.map(
      (principle) => `- **${principle.title}.** ${principle.rule}`
    ),
    "",
    "## Colors",
    "",
    ...paletteGroups.map((group) => colorGroupLine(group, system.colors)),
    "- shadcn aliases (`background`, `primary`, `muted`, `border` and the rest) resolve to these.",
    "",
    "## Typography",
    "",
    "Zen Kaku Gothic New, light and tight, for titles (`display`) and body. Geist Mono in the `label` utility for every label, number and button. Noto Sans JP (`jp`) only on route tabs, index page heroes and the nickname kana. Instrument Serif italic only for the wordmark.",
    "",
    "## Layout",
    "",
    "- Every page is a paper sheet in a strong hairline frame over two offset `paper-deep` backing sheets. Every route, index or detail, uses the same 60rem sheet (`max-w-sheet`). Sections, grids, figures and heroes take its full width. Paragraphs keep a 44rem measure (`max-w-column`) or `max-w-prose`.",
    "- The sheet's left edge is a bound strip: punched holes with dithered toner around them. Hover lights a lens that follows the pointer. A press punches the nearest hole and sends a ripple along the strip.",
    "- Route tabs sit on the sheet's left edge from `lg` and in a row above it on smaller screens. The active tab joins the sheet.",
    "- Long pages get a thumb index of notches on the sheet's right edge. Below `lg` it becomes a 4px progress strip. From `2xl` the companion rides a rail lane beside it. On phones it peeks from the bottom right corner.",
    "- The 48px top line holds the wordmark, ⌘K search and GitHub stars. The back cover is a stamped colophon below the sheet.",
    "- Sections sit 96px apart. Each opens with a panel heading over a strong rule.",
    "",
    "## Shapes",
    "",
    "Radius 0 everywhere. Frames are 1px hairlines. No shadows. Depth comes from the backing sheets, `hatch` fills and corner marks.",
    "",
    "## Components",
    "",
    ...componentSpecs.map((spec) => `- ${spec.name}: ${spec.summary}`),
    "",
    "## Motion",
    "",
    ...motionLines(system),
    ...componentMotionSpecs.map((spec) => `- ${spec.label}: ${spec.value}.`),
    "- Reduced motion: CSS snaps, sections show without a build, the companion holds a key pose, the hero field stays on its static frame.",
    "",
    "## Do's and Don'ts",
    "",
    ...guidance.do.map((item) => `- Do: ${item}`),
    ...guidance.dont.map((item) => `- Don't: ${item}`),
    "",
  ].join("\n");
