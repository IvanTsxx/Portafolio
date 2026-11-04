import { contrastRatio, gradeContrast, parseHex, toHex } from "./color";
import type { ContrastGrade, Rgb } from "./color";
import { findRules } from "./css-parse";
import type { CssRule, GlobalsCss } from "./css-parse";
import {
  colorSpecs,
  containerSpecs,
  defaultContrastGround,
  durationSpecs,
  easingSpecs,
  fontAliasNames,
  fontFamilySpecs,
  radiusStepNames,
  typeStepSpecs,
  typeTokenSpecs,
  typeUtilityNames,
  utilitySpecs,
} from "./specs";
import type {
  ColorGroup,
  ColorUtilityPrefix,
  ContainerName,
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

export const themeNames = ["light", "dark"] as const;

export type ThemeName = (typeof themeNames)[number];

export interface ThemeColor {
  alias: string | null;
  contrast: number;
  declared: string;
  grade: ContrastGrade;
  hex: string;
}

export interface ColorToken {
  against: string;
  cssVar: string;
  group: ColorGroup;
  name: string;
  prefix: ColorUtilityPrefix | null;
  role: string;
  tailwind: string | null;
  themes: Record<ThemeName, ThemeColor>;
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
  factor: number | null;
  name: RadiusStepName;
  px: number;
}

export interface TypeTokenValues {
  fontSize: string;
  letterSpacing: string;
  lineHeight: string;
  name: string;
}

export interface TypeStep {
  className: string;
  detail: string;
  sample: string;
  size: string;
  token: TypeTokenValues | null;
  use: string;
}

export interface ContainerToken {
  className: string;
  cssVar: string;
  name: ContainerName;
  px: number;
  use: string;
  width: string;
}

export interface UtilityTiming {
  easing: EasingName;
  ms: number;
}

export const formatTiming = (timing: UtilityTiming | null) =>
  timing ? `${timing.ms}ms ${timing.easing}` : null;

export interface UtilityDoc extends Omit<UtilitySpec, "name"> {
  name: UtilityName;
  timing: UtilityTiming | null;
}

export interface DesignSystem {
  colors: readonly ColorToken[];
  containers: readonly ContainerToken[];
  durations: readonly DurationSpec[];
  easings: readonly EasingToken[];
  fonts: readonly FontFamily[];
  radius: {
    base: string;
    baseVar: string;
    steps: readonly RadiusToken[];
  };
  typeScale: readonly TypeStep[];
  utilities: readonly UtilityDoc[];
}

const reducedMotionHeader = "@media (prefers-reduced-motion: reduce)";
const radiusBaseVar = "--radius";

export const tokenReferences = (): TokenReference[] => [
  ...colorSpecs.flatMap(({ name, prefix }) => [
    { name: `--${name}`, source: "root" as const },
    ...(prefix === null
      ? []
      : [{ name: `--color-${name}`, source: "theme" as const }]),
  ]),
  ...easingSpecs.map(({ name }) => ({
    name: `--ease-${name}`,
    source: "theme" as const,
  })),
  ...fontFamilySpecs.map(({ cssVar }) => ({
    name: cssVar,
    source: "theme" as const,
  })),
  ...fontAliasNames.map((name) => ({
    name: `--font-${name}`,
    source: "theme" as const,
  })),
  ...typeTokenSpecs.flatMap(({ name }) => [
    { name: `--text-${name}`, source: "theme" as const },
    { name: `--text-${name}--line-height`, source: "theme" as const },
    { name: `--text-${name}--letter-spacing`, source: "theme" as const },
  ]),
  ...containerSpecs.map(({ name }) => ({
    name: `--container-${name}`,
    source: "theme" as const,
  })),
  { name: radiusBaseVar, source: "root" },
  ...radiusStepNames.map((name) => ({
    name: `--radius-${name}`,
    source: "theme" as const,
  })),
  ...[...utilitySpecs.map(({ name }) => name), ...typeUtilityNames].map(
    (name) => ({ name, source: "utility" as const })
  ),
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

const varReference = /^var\(--[\w-]+\)$/u;

const referencedVariable = (value: string) =>
  varReference.test(value) ? value.slice("var(".length, -1) : null;

interface ResolvedValue {
  alias: string | null;
  resolved: string;
}

const resolveValue = (
  variables: ReadonlyMap<string, string>,
  declared: string
): ResolvedValue => {
  const alias = referencedVariable(declared);
  let resolved = declared;
  let name = alias;
  while (name !== null) {
    const next = variables.get(name);
    if (next === undefined) {
      throw new Error(`Unresolved CSS variable ${name}`);
    }
    resolved = next;
    name = referencedVariable(resolved);
  }
  return { alias, resolved };
};

interface ResolvedColor {
  alias: string | null;
  declared: string;
  rgb: Rgb;
}

const themeVariables = (globals: GlobalsCss, theme: ThemeName) =>
  theme === "dark" ? new Map([...globals.root, ...globals.dark]) : globals.root;

const resolveThemeColors = (
  globals: GlobalsCss,
  theme: ThemeName
): ReadonlyMap<string, ResolvedColor> => {
  const variables = themeVariables(globals, theme);
  return new Map(
    colorSpecs.map(({ name }) => {
      const declared = variables.get(`--${name}`) ?? "";
      const { alias, resolved } = resolveValue(variables, declared);
      const rgb = parseHex(resolved);
      if (!rgb) {
        throw new Error(
          `--${name} resolves to ${resolved} in the ${theme} theme, not a hex color`
        );
      }
      return [name, { alias, declared, rgb }] as const;
    })
  );
};

const buildThemeColor = (
  resolved: ReadonlyMap<string, ResolvedColor>,
  name: string,
  against: string
): ThemeColor => {
  const color = resolved.get(name);
  const ground = resolved.get(against);
  if (!color || !ground) {
    throw new Error(`${name} is documented on unknown token ${against}`);
  }
  const contrast = contrastRatio(color.rgb, ground.rgb);
  return {
    alias: color.alias,
    contrast,
    declared: color.declared,
    grade: gradeContrast(contrast),
    hex: toHex(color.rgb),
  };
};

const buildColors = (globals: GlobalsCss): ColorToken[] => {
  const light = resolveThemeColors(globals, "light");
  const dark = resolveThemeColors(globals, "dark");
  return colorSpecs.map((spec) => {
    const against = spec.on ?? defaultContrastGround;
    return {
      against,
      cssVar: `--${spec.name}`,
      group: spec.group,
      name: spec.name,
      prefix: spec.prefix,
      role: spec.role,
      tailwind: spec.prefix === null ? null : `${spec.prefix}-${spec.name}`,
      themes: {
        dark: buildThemeColor(dark, spec.name, against),
        light: buildThemeColor(light, spec.name, against),
      },
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

const lengthPattern = /^[\d.]+(?:px|rem)?$/u;

const lengthToPx = (value: string) => {
  const trimmed = value.trim();
  if (!lengthPattern.test(trimmed)) {
    return 0;
  }
  return trimmed.endsWith("rem")
    ? Number(trimmed.slice(0, -"rem".length)) * 16
    : Number(trimmed.replace("px", ""));
};

const radiusFactorPrefix = "calc(var(--radius) *";
const radiusBaseReference = "var(--radius)";

const radiusFactor = (declared: string) => {
  if (declared === radiusBaseReference) {
    return 1;
  }
  return declared.startsWith(radiusFactorPrefix)
    ? Number(declared.slice(radiusFactorPrefix.length, -1))
    : null;
};

const buildRadius = (globals: GlobalsCss): DesignSystem["radius"] => {
  const base = globals.root.get(radiusBaseVar) ?? "0";
  const basePx = lengthToPx(base);
  return {
    base,
    baseVar: radiusBaseVar,
    steps: radiusStepNames.map((name) => {
      const declared = globals.theme.get(`--radius-${name}`) ?? "";
      const factor = radiusFactor(declared);
      return {
        className: `rounded-${name}`,
        cssVar: `--radius-${name}`,
        factor,
        name,
        px: factor === null ? lengthToPx(declared) : basePx * factor,
      };
    }),
  };
};

const clampPrefix = "clamp(";

const clampRange = (value: string) => {
  if (!value.startsWith(clampPrefix) || !value.endsWith(")")) {
    return value;
  }
  const parts = value
    .slice(clampPrefix.length, -1)
    .split(",")
    .map((part) => part.trim());
  const min = lengthToPx(parts.at(0) ?? "");
  const max = lengthToPx(parts.at(-1) ?? "");
  return min > 0 && max > 0 ? `${min}-${max}` : value;
};

const buildTypeScale = (globals: GlobalsCss): TypeStep[] => [
  ...typeTokenSpecs.map((spec) => {
    const prefix = `--text-${spec.name}`;
    const token = {
      fontSize: globals.theme.get(prefix) ?? "",
      letterSpacing: globals.theme.get(`${prefix}--letter-spacing`) ?? "",
      lineHeight: globals.theme.get(`${prefix}--line-height`) ?? "",
      name: spec.name,
    };
    return {
      className: spec.className,
      detail: `${token.lineHeight} line height, ${token.letterSpacing} tracking`,
      sample: spec.sample,
      size: clampRange(token.fontSize),
      token,
      use: spec.use,
    };
  }),
  ...typeStepSpecs.map((spec) => ({ ...spec, detail: "", token: null })),
];

const buildContainers = (globals: GlobalsCss): ContainerToken[] =>
  containerSpecs.map((spec) => {
    const width = globals.theme.get(`--container-${spec.name}`) ?? "";
    return {
      className: `max-w-${spec.name}`,
      cssVar: `--container-${spec.name}`,
      name: spec.name,
      px: lengthToPx(width),
      use: spec.use,
      width,
    };
  });

const timingPattern = /\d+ms var\(--ease-[\w-]+\)/u;

const utilityTiming = (rule: CssRule | undefined): UtilityTiming | null => {
  const [declared] = timingPattern.exec(rule?.body ?? "") ?? [];
  const [duration = "", reference = ""] = declared?.split(" ") ?? [];
  const easing = easingSpecs.find(
    ({ name }) => `var(--ease-${name})` === reference
  );
  return easing
    ? { easing: easing.name, ms: Number(duration.slice(0, -"ms".length)) }
    : null;
};

const buildUtilities = (globals: GlobalsCss): UtilityDoc[] =>
  utilitySpecs.map((spec) => ({
    ...spec,
    timing: utilityTiming(globals.utilities.get(spec.name)),
  }));

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
    containers: buildContainers(globals),
    durations: durationSpecs,
    easings: buildEasings(globals),
    fonts: buildFonts(globals),
    radius: buildRadius(globals),
    typeScale: buildTypeScale(globals),
    utilities: buildUtilities(globals),
  };
};
