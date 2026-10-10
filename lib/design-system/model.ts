import {
  compositeOver,
  contrastRatio,
  gradeContrast,
  oklchToSrgb,
  parseOklch,
  toHex,
} from "./color";
import type { ContrastGrade, Rgb } from "./color";
import { findRules, ruleToCss } from "./css-parse";
import type { GlobalsCss } from "./css-parse";
import {
  colorSpecs,
  durationSpecs,
  easingSpecs,
  fontFamilySpecs,
  radiusStepNames,
  utilitySpecs,
} from "./specs";
import type {
  ColorGroup,
  ColorUtilityPrefix,
  DurationSpec,
  EasingName,
  FontClassName,
  FontFamilySpec,
  RadiusStepName,
  UtilityName,
  UtilitySpec,
} from "./specs";

export type TokenSource = "root" | "rule" | "theme" | "utility";

export interface TokenReference {
  name: string;
  source: TokenSource;
}

export interface ColorToken {
  against: string;
  alias: string | null;
  alpha: number;
  contrast: number;
  cssVar: string;
  declared: string;
  grade: ContrastGrade;
  group: ColorGroup;
  hex: string;
  name: string;
  oklch: string;
  prefix: ColorUtilityPrefix;
  role: string;
  tailwind: string;
}

export interface EasingToken {
  className: string;
  cssVar: string;
  curve: string;
  name: EasingName;
  use: string;
}

export interface FontFamily extends Omit<FontFamilySpec, "className"> {
  className: FontClassName;
  stack: string;
}

export interface RadiusToken {
  className: string;
  cssVar: string;
  factor: number;
  name: RadiusStepName;
  px: number;
}

export interface UtilityDoc extends Omit<UtilitySpec, "name"> {
  css: string;
  name: UtilityName;
}

export interface TextLabelToken {
  className: string;
  letterSpacing: string;
  lineHeight: string;
  size: string;
}

export interface DesignSystem {
  colors: readonly ColorToken[];
  durations: readonly DurationSpec[];
  easings: readonly EasingToken[];
  fonts: readonly FontFamily[];
  radius: {
    base: string;
    baseVar: string;
    steps: readonly RadiusToken[];
  };
  reducedMotionCss: string;
  textLabel: TextLabelToken;
  utilities: readonly UtilityDoc[];
}

const reducedMotionHeader = "@media (prefers-reduced-motion: reduce)";
const textLabelVar = "--text-label";
const radiusBaseVar = "--radius";

export const tokenReferences = (): TokenReference[] => [
  ...colorSpecs.flatMap(({ name }) => [
    { name: `--${name}`, source: "root" as const },
    { name: `--color-${name}`, source: "theme" as const },
  ]),
  ...easingSpecs.map(({ name }) => ({
    name: `--ease-${name}`,
    source: "theme" as const,
  })),
  ...fontFamilySpecs.map(({ cssVar }) => ({
    name: cssVar,
    source: "theme" as const,
  })),
  { name: radiusBaseVar, source: "root" },
  ...radiusStepNames.map((name) => ({
    name: `--radius-${name}`,
    source: "theme" as const,
  })),
  { name: textLabelVar, source: "theme" },
  { name: `${textLabelVar}--line-height`, source: "theme" },
  { name: `${textLabelVar}--letter-spacing`, source: "theme" },
  ...utilitySpecs.map(({ name }) => ({
    name,
    source: "utility" as const,
  })),
  { name: reducedMotionHeader, source: "rule" },
];

export const findMissingTokens = (
  globals: GlobalsCss,
  references: readonly TokenReference[]
): TokenReference[] =>
  references.filter((reference) => {
    switch (reference.source) {
      case "root": {
        return !globals.root.has(reference.name);
      }
      case "theme": {
        return !globals.theme.has(reference.name);
      }
      case "utility": {
        return !globals.utilities.has(reference.name);
      }
      case "rule": {
        return (
          findRules(globals.rules, (rule) =>
            rule.header.startsWith(reference.name)
          ).length === 0
        );
      }
      default: {
        return true;
      }
    }
  });

const varReference = /^var\((--[\w-]+)\)$/u;

interface ResolvedValue {
  alias: string | null;
  resolved: string;
}

const resolveRootValue = (
  root: ReadonlyMap<string, string>,
  declared: string
): ResolvedValue => {
  const first = varReference.exec(declared);
  let resolved = declared;
  let match = varReference.exec(resolved);
  while (match?.[1] !== undefined) {
    const next = root.get(match[1]);
    if (next === undefined) {
      throw new Error(`Unresolved CSS variable ${match[1]}`);
    }
    resolved = next;
    match = varReference.exec(resolved);
  }
  return { alias: first?.[1] ?? null, resolved };
};

const rgbOfOpaque = (value: string): Rgb => {
  const oklch = parseOklch(value);
  if (!oklch) {
    throw new Error(`Expected an oklch color, received ${value}`);
  }
  return oklchToSrgb(oklch);
};

const buildColors = (globals: GlobalsCss): ColorToken[] => {
  const paperDeclared = globals.root.get("--paper");
  if (paperDeclared === undefined) {
    throw new Error("--paper is not declared in :root");
  }
  const paper = rgbOfOpaque(
    resolveRootValue(globals.root, paperDeclared).resolved
  );

  const resolved = colorSpecs.map((spec) => {
    const declared = globals.root.get(`--${spec.name}`) ?? "";
    const { alias, resolved: value } = resolveRootValue(globals.root, declared);
    const oklch = parseOklch(value);
    if (!oklch) {
      throw new Error(
        `--${spec.name} resolves to ${value}, not an oklch color`
      );
    }
    return {
      alias,
      declared,
      effective: compositeOver(oklchToSrgb(oklch), oklch.alpha, paper),
      oklch,
      spec,
      value,
    };
  });
  const effectiveByName = new Map(
    resolved.map((entry) => [entry.spec.name, entry.effective] as const)
  );

  return resolved.map(({ alias, declared, effective, oklch, spec, value }) => {
    const against = spec.on ?? "paper";
    const background = effectiveByName.get(against);
    if (!background) {
      throw new Error(`${spec.name} is documented on unknown token ${against}`);
    }
    const contrast = contrastRatio(effective, background);
    return {
      against,
      alias,
      alpha: oklch.alpha,
      contrast,
      cssVar: `--${spec.name}`,
      declared,
      grade: gradeContrast(contrast),
      group: spec.group,
      hex: toHex(effective),
      name: spec.name,
      oklch: value,
      prefix: spec.prefix,
      role: spec.role,
      tailwind: `${spec.prefix}-${spec.name}`,
    };
  });
};

const buildEasings = (globals: GlobalsCss): EasingToken[] =>
  easingSpecs.map((spec) => ({
    className: `ease-${spec.name}`,
    cssVar: `--ease-${spec.name}`,
    curve: globals.theme.get(`--ease-${spec.name}`) ?? "",
    name: spec.name,
    use: spec.use,
  }));

const buildFonts = (globals: GlobalsCss): FontFamily[] =>
  fontFamilySpecs.map((spec) => ({
    ...spec,
    stack: globals.theme.get(spec.cssVar) ?? "",
  }));

const lengthToPx = (value: string) => {
  const match = /^([\d.]+)(px|rem)?$/u.exec(value.trim());
  if (!match?.[1]) {
    return 0;
  }
  const amount = Number(match[1]);
  return match[2] === "rem" ? amount * 16 : amount;
};

const radiusFactor = (declared: string) => {
  const match = /calc\(var\(--radius\)\s*\*\s*([\d.]+)\)/u.exec(declared);
  return match?.[1] ? Number(match[1]) : 1;
};

const buildRadius = (globals: GlobalsCss): DesignSystem["radius"] => {
  const base = globals.root.get(radiusBaseVar) ?? "0";
  const basePx = lengthToPx(base);
  return {
    base,
    baseVar: radiusBaseVar,
    steps: radiusStepNames.map((name) => {
      const factor = radiusFactor(globals.theme.get(`--radius-${name}`) ?? "");
      return {
        className: `rounded-${name}`,
        cssVar: `--radius-${name}`,
        factor,
        name,
        px: basePx * factor,
      };
    }),
  };
};

const buildUtilities = (globals: GlobalsCss): UtilityDoc[] =>
  utilitySpecs.map((spec) => {
    const rule = globals.utilities.get(spec.name);
    return { ...spec, css: rule ? ruleToCss(rule) : "" };
  });

const buildReducedMotionCss = (globals: GlobalsCss) => {
  const [rule] = findRules(globals.rules, (candidate) =>
    candidate.header.startsWith(reducedMotionHeader)
  );
  return rule ? ruleToCss(rule) : "";
};

const buildTextLabel = (globals: GlobalsCss): TextLabelToken => ({
  className: "text-label",
  letterSpacing: globals.theme.get(`${textLabelVar}--letter-spacing`) ?? "",
  lineHeight: globals.theme.get(`${textLabelVar}--line-height`) ?? "",
  size: globals.theme.get(textLabelVar) ?? "",
});

export const buildDesignSystem = (globals: GlobalsCss): DesignSystem => {
  const missing = findMissingTokens(globals, tokenReferences());
  if (missing.length > 0) {
    throw new Error(
      `Design system documents tokens missing from app/globals.css: ${missing
        .map((reference) => `${reference.source}:${reference.name}`)
        .join(", ")}`
    );
  }
  return {
    colors: buildColors(globals),
    durations: durationSpecs,
    easings: buildEasings(globals),
    fonts: buildFonts(globals),
    radius: buildRadius(globals),
    reducedMotionCss: buildReducedMotionCss(globals),
    textLabel: buildTextLabel(globals),
    utilities: buildUtilities(globals),
  };
};
