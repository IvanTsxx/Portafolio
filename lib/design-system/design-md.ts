import { siteConfig } from "@/lib/site/config";

import type { ColorToken, DesignSystem } from "./model";
import { guidance, principles } from "./philosophy";
import { colorGroupLabels, spacingSpecs } from "./specs";
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
    "- Every page is a paper sheet in a strong hairline frame over two offset `paper-deep` backing sheets. Index pages center a 44rem column (`max-w-column`). Detail pages use `max-w-6xl`.",
    "- Route tabs sit on the sheet's left edge from `lg` and in a row above it on smaller screens. The active tab joins the sheet.",
    "- Long pages get a thumb index of notches right of the column. Below `lg` it becomes a 4px progress strip.",
    "- The 48px top line holds the wordmark, back to top, ⌘K search and GitHub stars. The back cover is a stamped colophon below the sheet.",
    "- Sections sit 96px apart on index pages and 64px on detail pages. Each opens with a panel heading over a strong rule.",
    "",
    "## Shapes",
    "",
    "Radius 0 everywhere. Frames are 1px hairlines. No shadows. Depth comes from the backing sheets, `hatch` fills and corner marks.",
    "",
    "## Components",
    "",
    "- Panel heading: `[ XX-NN ]`, mono label, dotted leader, aside.",
    "- Page hero: doc code, display title, hazard stripe, lede, over a seeded dither field at 10% ink. The field breathes while in view and swells under the mouse.",
    "- Figure plate: framed figure with corner marks and one readout row.",
    "- Specimen cell: hairline cell. Hover fills `paper-deep`.",
    "- Button: mono label, 44px, solid ink or outline. Hover inverts.",
    "- Chip: mono label in a frame. Pressed chips invert to ink.",
    "- Link: `ink-underline` draws on hover or focus. Cards show corner marks. Nothing lifts.",
    "- Companion: the one 3D agent, 48×56 on the rail. It narrates in first person and builds sections.",
    "",
    "## Motion",
    "",
    ...motionLines(system),
    "- Reduced motion: CSS snaps, the companion holds a key pose, the hero field stays on its static frame.",
    "",
    "## Do's and Don'ts",
    "",
    ...guidance.do.map((item) => `- Do: ${item}`),
    ...guidance.dont.map((item) => `- Don't: ${item}`),
    "",
  ].join("\n");
