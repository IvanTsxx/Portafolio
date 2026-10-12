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
    "A personal portfolio rendered as a technical document on paper: numbered panels, mono labels with Japanese annotations, hairline rules, hatch fills and dithered imagery. Ink and paper carry the interface. Small orange 3D agents are the only color and the only playful element.",
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
    "Zen Kaku Gothic New, light and tightly tracked, for names and titles. Geist Mono, 10px uppercase and tracked, for every label, number and button. Noto Sans JP for short Japanese annotations beside section labels. Instrument Serif italic only for the wordmark.",
    "",
    "## Layout",
    "",
    "Index pages run in one centered reading column, 44rem wide. From xl a quiet index or filter list sits on its left and sticks while the column scrolls; below xl the list sits inline under the intro. The home intro carries the identity dossier: portrait, name, bio, GitHub readouts and links. A single hairline closes each page intro. Detail pages run in a wider centered column. Spacing follows a 4px scale. Sections are separated by 96px and open with a panel heading: `[ XX-NN ]  LABEL  日本語 ........ 06 / 06` over a strong rule. As a section scrolls in, its scaffold rules draw first and its content fills in while the companion agent builds it.",
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
    "- **Panel heading:** index in brackets, mono label, Japanese annotation, dotted leader, count.",
    "- **Specimen card:** hairline frame, corner marks, mono index top-left, square badge top-right, light title, one-line summary, mono footer row.",
    "- **Button:** 44px, square, mono uppercase label. Primary is ink on paper inverted; outline is a 1px ink frame. State flips in 100ms.",
    "- **Chip:** square hairline frame with a mono label; active chips invert to ink.",
    "- **Leader row:** mono key, dotted leader, value aligned right.",
    "- **Agent:** small orange box-shaped 3D mascot with role accessories. One per view, hover and click reactions, static fallback without WebGL.",
    "",
    "## Do's and Don'ts",
    "",
    ...guidance.do.map((item) => `- Do: ${item}`),
    ...guidance.dont.map((item) => `- Don't: ${item}`),
    "",
  ].join("\n");
