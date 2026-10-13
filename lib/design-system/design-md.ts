import { siteConfig } from "@/lib/site/config";

import type { ColorToken, DesignSystem } from "./model";
import { guidance, principles } from "./philosophy";
import { spacingSpecs } from "./specs";

const quote = (value: string) => JSON.stringify(value);

const yamlMap = (
  key: string,
  entries: readonly (readonly [string, string])[],
  indent = ""
) => [
  `${indent}${key}:`,
  ...entries.map(([name, value]) => `${indent}  ${name}: ${quote(value)}`),
];

const typographyTokens = (system: DesignSystem) => {
  const sans = system.fonts.find((font) => font.className === "font-sans");
  const mono = system.fonts.find((font) => font.className === "font-mono");
  const jp = system.fonts.find((font) => font.className === "font-jp");
  const sansFamily = sans?.name ?? "Zen Kaku Gothic New";
  const monoFamily = mono?.name ?? "Geist Mono";
  return [
    [
      "display",
      {
        fontFamily: sansFamily,
        fontSize: "6rem",
        fontWeight: "300",
        letterSpacing: "-0.05em",
        lineHeight: "0.88",
      },
    ],
    [
      "title",
      {
        fontFamily: sansFamily,
        fontSize: "3rem",
        fontWeight: "300",
        letterSpacing: "-0.05em",
        lineHeight: "0.88",
      },
    ],
    [
      "heading",
      {
        fontFamily: sansFamily,
        fontSize: "1.25rem",
        fontWeight: "300",
        lineHeight: "1.25",
      },
    ],
    [
      "body",
      {
        fontFamily: sansFamily,
        fontSize: "1rem",
        fontWeight: "400",
        lineHeight: "1.5",
      },
    ],
    [
      "body-sm",
      {
        fontFamily: sansFamily,
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "1.625",
      },
    ],
    [
      "label",
      {
        fontFamily: monoFamily,
        fontSize: "0.625rem",
        fontWeight: "400",
        letterSpacing: "0.16em",
        lineHeight: "0.875rem",
      },
    ],
    [
      "numeral",
      {
        fontFamily: monoFamily,
        fontFeature: "tnum",
        fontSize: "1.875rem",
        fontWeight: "300",
      },
    ],
    [
      "annotation-jp",
      {
        fontFamily: jp?.name ?? "Noto Sans JP",
        fontSize: "0.625rem",
        fontWeight: "400",
      },
    ],
  ] as const;
};

const paletteColors = (system: DesignSystem) =>
  system.colors.filter((token) => token.alias === null);

const frontMatter = (system: DesignSystem) => {
  const typography = typographyTokens(system).flatMap(([name, style]) => [
    `  ${name}:`,
    ...Object.entries(style).map(
      ([property, value]) => `    ${property}: ${quote(value)}`
    ),
  ]);
  return [
    "---",
    "version: alpha",
    `name: ${quote(`${siteConfig.nickname} · Paper and ink`)}`,
    `description: ${quote("A technical document on paper. Ink type, hairline rules, numbered panels, and small orange 3D agents as the only color.")}`,
    ...yamlMap(
      "colors",
      paletteColors(system).map((token) => [token.name, token.hex])
    ),
    "typography:",
    ...typography,
    ...yamlMap("rounded", [
      ["none", "0px"],
      ...system.radius.steps.map(
        (step) => [step.name, `${step.px}px`] as const
      ),
    ]),
    ...yamlMap(
      "spacing",
      spacingSpecs.map((step) => [step.step, `${step.px}px`])
    ),
    "components:",
    "  button-primary:",
    '    backgroundColor: "{colors.ink}"',
    '    textColor: "{colors.paper}"',
    '    typography: "{typography.label}"',
    '    rounded: "{rounded.none}"',
    '    height: "44px"',
    "  button-outline:",
    '    backgroundColor: "{colors.paper}"',
    '    textColor: "{colors.ink}"',
    '    typography: "{typography.label}"',
    '    rounded: "{rounded.none}"',
    '    height: "44px"',
    "  chip:",
    '    backgroundColor: "{colors.paper}"',
    '    textColor: "{colors.ink}"',
    '    typography: "{typography.label}"',
    '    rounded: "{rounded.none}"',
    '    padding: "4px 8px"',
    "  chip-active:",
    '    backgroundColor: "{colors.ink}"',
    '    textColor: "{colors.paper}"',
    "  card:",
    '    backgroundColor: "{colors.paper}"',
    '    textColor: "{colors.ink}"',
    '    rounded: "{rounded.none}"',
    '    padding: "20px"',
    "  panel-heading:",
    '    textColor: "{colors.ink}"',
    '    typography: "{typography.label}"',
    "---",
  ];
};

const colorLine = (token: ColorToken) =>
  `- **${token.name} (${token.hex}):** ${token.role}.`;

export const renderDesignMarkdown = (system: DesignSystem) =>
  [
    ...frontMatter(system),
    "",
    "## Overview",
    "",
    "A personal portfolio rendered as a technical document on paper: numbered panels, mono labels, hairline rules, hatch fills and dithered imagery. Ink and paper carry the interface. Small orange 3D agents are the only color and the only playful element.",
    "",
    ...principles.map(
      (principle) => `- **${principle.title}.** ${principle.rule}`
    ),
    "",
    "## Colors",
    "",
    "High-contrast neutrals on warm paper. Clay orange is reserved for the 3D agents and never used for UI chrome.",
    "",
    ...paletteColors(system).map(colorLine),
    "",
    "## Typography",
    "",
    "Zen Kaku Gothic New, light and tightly tracked, for names and titles. Geist Mono, 10px uppercase and tracked, for every label, number and button. Noto Sans JP for Japanese annotations, a rare decoration used only on route tabs and page heroes. Instrument Serif italic only for the wordmark.",
    "",
    "## Layout",
    "",
    "Every page is a dossier sheet: a hairline-framed paper sheet over two offset paper-deep backing sheets. Index pages share one sheet around a 44rem column; detail pages use a wider sheet. Routes are divider tabs on the sheet's left edge, a tab row on its top edge on phones, and the active tab sits flush with the sheet. Long pages carry a thumb index of notches cut into the sheet's right edge, the current one in ink; on phones it becomes a thin progress strip. The top line holds only the wordmark and search. The footer is the back cover: a stamped colophon on the backing sheet. Filters fold under the intro. The home intro carries the identity dossier: portrait, name, bio, GitHub readouts and links. A single hairline closes each page intro. Spacing follows a 4px scale. Sections are separated by 96px and open with a panel heading: `[ XX-NN ]  LABEL ........ 06 / 06` over a strong rule. As a section scrolls in, its scaffold rules draw first and its content fills in while the companion agent builds it.",
    "",
    "## Elevation & Depth",
    "",
    "Flat. No shadows. Depth comes from rules, recessed paper-deep fills, hatch patterns and crosshair corner marks. The only real depth is the 3D agents, rendered in one shared canvas.",
    "",
    "## Shapes",
    "",
    "Square everything. Radius is 0 on cards, buttons, chips, inputs and images. Frames are 1px hairlines; strong rules mark section boundaries.",
    "",
    "## Components",
    "",
    "- **Panel heading:** index in brackets, mono label, dotted leader, count.",
    "- **Specimen card:** hairline frame, corner marks, mono index top-left, square badge top-right, light title, one-line summary, mono footer row.",
    "- **Button:** 44px, square, mono uppercase label. Primary is ink on paper inverted; outline is a 1px ink frame. State flips in 100ms.",
    "- **Chip:** square hairline frame with a mono label; active chips invert to ink.",
    "- **Leader row:** mono key, dotted leader, value aligned right.",
    "- **Hero field:** a 4×4 Bayer dither of seeded noise behind every page hero, ink at 10% on paper, dense in the top right and fading toward the title side and the bottom rule. Each page seeds it with its doc code. It is server-rendered SVG; a hovering mouse drifts its rows like the portrait, gentler, and reduced motion keeps the static field.",
    "- **Agent:** small orange box-shaped 3D mascot with role accessories. One per view, hover and click reactions, static fallback without WebGL.",
    "",
    "## Do's and Don'ts",
    "",
    ...guidance.do.map((item) => `- Do: ${item}`),
    ...guidance.dont.map((item) => `- Don't: ${item}`),
    "",
  ].join("\n");
