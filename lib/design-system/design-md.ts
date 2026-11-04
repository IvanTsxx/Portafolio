import { formatTiming } from "./model";
import type { ColorToken, DesignSystem } from "./model";
import { guidance, principles } from "./philosophy";
import {
  componentSpecs,
  documentGridSpec,
  fontAliasNames,
  spacingSpecs,
  stepPx,
  utilitiesIn,
} from "./specs";
import type { ColorGroup, UtilityGroup } from "./specs";

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
  "text",
  "line",
  "state",
  "code",
] as const satisfies readonly ColorGroup[];

const paletteGroupSet = new Set<ColorGroup>(paletteGroups);

export const paletteColors = (system: DesignSystem) =>
  system.colors.filter((token) => paletteGroupSet.has(token.group));

export const aliasColors = (system: DesignSystem) =>
  system.colors.filter((token) => token.group === "alias");

const serifName = (system: DesignSystem) =>
  system.fonts.find((font) => font.className === "font-serif")?.name ??
  "Instrument Serif";

const typographyTokens = (system: DesignSystem) =>
  system.typeScale.flatMap((step) =>
    step.token
      ? [
          [
            step.token.name,
            {
              fontFamily: serifName(system),
              fontSize: step.token.fontSize,
              fontWeight: "400",
              letterSpacing: step.token.letterSpacing,
              lineHeight: step.token.lineHeight,
            },
          ] as const,
        ]
      : []
  );

const frontMatter = (system: DesignSystem) => [
  "---",
  "version: alpha",
  `name: ${quote("Ivo · Observatory")}`,
  `description: ${quote("A quiet, monochrome observatory: editorial type and measured grids on a charcoal or warm light ground, with the Lab experiments as the expressive artifacts.")}`,
  ...yamlMap("colors", [
    ...paletteColors(system).map(
      (token) => [token.name, token.themes.dark.hex] as const
    ),
    ...paletteColors(system).map(
      (token) => [`${token.name}-light`, token.themes.light.hex] as const
    ),
  ]),
  "typography:",
  ...typographyTokens(system).flatMap(([name, style]) => [
    `  ${name}:`,
    ...Object.entries(style).map(
      ([property, value]) => `    ${property}: ${quote(value)}`
    ),
  ]),
  ...yamlMap(
    "rounded",
    system.radius.steps.map((step) => [step.name, `${step.px}px`] as const)
  ),
  ...yamlMap(
    "spacing",
    spacingSpecs.map((step) => [step.step, `${step.px}px`])
  ),
  "---",
];

const colorRow = (token: ColorToken) =>
  `| \`${token.name}\` | \`${token.themes.light.hex}\` | \`${token.themes.dark.hex}\` | ${token.role} |`;

const aliasLine = (token: ColorToken) =>
  `\`${token.name}\` to \`${token.themes.light.alias?.replace("--", "") ?? ""}\``;

const fontLines = (system: DesignSystem) =>
  system.fonts.map(
    (font) => `- ${font.name} (\`${font.className}\`): ${font.role}.`
  );

const typeLines = (system: DesignSystem) =>
  system.typeScale.map((step) =>
    step.token
      ? `- \`${step.className.replace("display ", "")}\`: ${step.size}px fluid, ${step.detail}. ${step.use}.`
      : `- \`${step.className.replace("text-muted-foreground ", "")}\`: ${step.size}px. ${step.use}.`
  );

const containerLines = (system: DesignSystem) =>
  system.containers.map(
    (container) =>
      `- \`${container.className}\`: ${container.width}. ${container.use}.`
  );

const radiusLine = (system: DesignSystem) =>
  system.radius.steps
    .map((step) => `\`${step.className}\` ${step.px}px`)
    .join(", ");

const utilityNames = (group: UtilityGroup) =>
  utilitiesIn(group)
    .map((utility) => `\`${utility.name}\``)
    .join(", ");

const motionLines = (system: DesignSystem) => [
  ...system.easings.map(
    (easing) => `- \`${easing.className}\` (${easing.curve}): ${easing.use}.`
  ),
  `- Durations: ${system.durations.map((duration) => `\`${duration.className}\` ${duration.use.toLowerCase()}`).join(", ")}.`,
  ...system.utilities.flatMap((utility) => {
    if (utility.group !== "motion") {
      return [];
    }
    const timing = formatTiming(utility.timing);
    return [
      `- \`${utility.name}\`${timing ? ` (${timing})` : ""}: ${utility.summary}`,
    ];
  }),
];

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
    "One set of semantic tokens, two art-directed themes. `:root` is light and `.dark` is dark. The front matter lists dark values by token name and light values with a `-light` suffix.",
    "",
    "| Token | Light | Dark | Role |",
    "| --- | --- | --- | --- |",
    ...paletteColors(system).map(colorRow),
    "",
    `- Aliases for the shadcn primitives in components/ui and the registry: ${aliasColors(system).map(aliasLine).join(", ")}.`,
    "",
    "## Typography",
    "",
    ...fontLines(system),
    "",
    `Three families, no more. The serif is set through \`display\` and also answers to ${fontAliasNames.map((name) => `\`font-${name}\``).join(", ")}. \`label\` is the mono voice for every index, number and button. \`spaced\` is for eyebrows.`,
    "",
    ...typeLines(system),
    "",
    "## Layout",
    "",
    `- Page gutters are ${stepPx(documentGridSpec.gutters[0])}px on phones and ${stepPx(documentGridSpec.gutters[1])}px from \`md\`. Sections sit ${stepPx(documentGridSpec.sectionGap)}px apart and each opens with a panel heading.`,
    ...containerLines(system),
    `- Reading measure: \`${documentGridSpec.measure.className}\`, ${documentGridSpec.measure.width}.`,
    `- Spacing follows the 4px scale: ${spacingSpecs.map((step) => step.step).join(", ")}.`,
    "- Whitespace and type come before containers. Cards stay borderless unless a frame explains something.",
    `- Layout helpers: ${utilityNames("layout")}.`,
    "",
    "## Shapes",
    "",
    `Radius derives from \`--radius\` (${system.radius.base}): ${radiusLine(system)}. Frames are 1px hairlines in \`border\` and \`border-strong\`. No shadows. Depth comes from contrast, scale and light, plus the marks ${utilityNames("mark")}.`,
    "",
    "## Components",
    "",
    ...componentSpecs.map(
      (spec) => `- ${spec.name} (\`${spec.file}\`): ${spec.summary}`
    ),
    "",
    "## Motion",
    "",
    `Animate transform and opacity only. Transitions run ${system.durations.at(0)?.ms}ms to ${system.durations.at(-1)?.ms}ms. Under \`prefers-reduced-motion\` every animation and transition snaps in 0.01ms.`,
    "",
    ...motionLines(system),
    "",
    "## Do's and Don'ts",
    "",
    ...guidance.do.map((item) => `- Do: ${item}`),
    ...guidance.dont.map((item) => `- Don't: ${item}`),
    "",
  ].join("\n");
