import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { contrastRatio, parseHex } from "./color";
import { findRules, parseGlobalsCss } from "./css-parse";
import { paletteColors, renderDesignMarkdown } from "./design-md";
import { designMarkdownPath, globalsCssPath, loadDesignMarkdown } from "./load";
import { designMarkdownResponse } from "./markdown-response";
import { buildDesignSystem, findMissingTokens, tokenReferences } from "./model";
import type { ColorToken, ThemeName } from "./model";
import {
  colorSpecs,
  containerSpecs,
  documentGridSpec,
  durationSpecs,
  easingSpecs,
  fontAliasNames,
  fontFamilySpecs,
  radiusStepNames,
  spacingSpecs,
  typeTokenSpecs,
  typeUtilityNames,
  utilitySpecs,
} from "./specs";
import type { FontClassName } from "./specs";

const projectRoot = process.cwd();

const readProjectFile = (relativePath: string) =>
  readFile(path.join(projectRoot, relativePath), "utf-8");

const globalsSource = await readProjectFile(globalsCssPath);
const globals = parseGlobalsCss(globalsSource);
const system = buildDesignSystem(globals);

const tokenNamed = (name: string): ColorToken => {
  const token = system.colors.find((candidate) => candidate.name === name);
  if (!token) {
    throw new Error(`${name} is not documented`);
  }
  return token;
};

const contrastIn = (theme: ThemeName, name: string) => {
  const token = tokenNamed(name);
  return token.themes[theme].contrast;
};

const utilityNamed = (name: string) =>
  system.utilities.find((entry) => entry.name === name);

const utilityCss = (name: string) =>
  globals.utilities.get(name)?.body.replaceAll(/\s+/gu, " ") ?? "";

const themeNamesWith = (prefix: string) =>
  [...globals.theme.keys()].filter((name) => name.startsWith(prefix));

const nonColorDarkDeclarations = new Set(["--grain-opacity", "color-scheme"]);

describe("tokens used in the doc exist in globals.css", () => {
  test("every documented token resolves in :root, @theme or @utility", () => {
    expect(findMissingTokens(globals, tokenReferences())).toEqual([]);
  });

  test("reports a documented token that globals.css does not declare", () => {
    const missing = findMissingTokens(globals, [
      { name: "--background", source: "root" },
      { name: "--vermilion", source: "root" },
      { name: "--color-vermilion", source: "theme" },
      { name: "sparkle", source: "utility" },
    ]);
    expect(missing).toEqual([
      { name: "--vermilion", source: "root" },
      { name: "--color-vermilion", source: "theme" },
      { name: "sparkle", source: "utility" },
    ]);
  });

  test("building the model fails when a documented color is removed", () => {
    const withoutSignal = parseGlobalsCss(
      globalsSource.replace("  --signal:", "  --signal-gone:")
    );
    expect(() => buildDesignSystem(withoutSignal)).toThrow("root:--signal");
  });

  test("every @theme color token and @utility in globals.css is documented", () => {
    const documentedColors = new Set(
      colorSpecs.map(({ name }) => `--color-${name}`)
    );
    const themeColors = [...globals.theme.keys()].filter((name) =>
      name.startsWith("--color-")
    );
    expect(themeColors.filter((name) => !documentedColors.has(name))).toEqual(
      []
    );
    const documentedUtilities = new Set<string>([
      ...utilitySpecs.map(({ name }) => name),
      ...typeUtilityNames,
    ]);
    expect(
      [...globals.utilities.keys()].filter(
        (name) => !documentedUtilities.has(name)
      )
    ).toEqual([]);
  });

  test("every hex color in :root and every .dark override is documented", () => {
    const documented = new Set(colorSpecs.map(({ name }) => `--${name}`));
    const hexInRoot = [...globals.root].flatMap(([name, value]) =>
      value.startsWith("#") ? [name] : []
    );
    expect(hexInRoot.filter((name) => !documented.has(name))).toEqual([]);
    const darkOverrides = [...globals.dark.keys()].filter(
      (name) => !nonColorDarkDeclarations.has(name)
    );
    expect(darkOverrides.filter((name) => !documented.has(name))).toEqual([]);
  });
});

describe("colors in both themes", () => {
  test("light and dark carry the brand grounds", () => {
    expect(tokenNamed("background").themes.light.hex).toBe("#f7f6f2");
    expect(tokenNamed("background").themes.dark.hex).toBe("#0b0b0c");
    expect(tokenNamed("foreground").themes.dark.hex).toBe("#edece8");
  });

  test("aliases resolve against the theme they are read in", () => {
    const muted = tokenNamed("muted");
    const surface = tokenNamed("surface");
    expect(muted.themes.light.alias).toBe("--surface");
    expect(muted.themes.light.hex).toBe(surface.themes.light.hex);
    expect(muted.themes.dark.hex).toBe(surface.themes.dark.hex);
    expect(muted.themes.dark.hex).not.toBe(muted.themes.light.hex);
  });

  test("text clears AA and the quiet tokens clear the large-text bar in both themes", () => {
    for (const theme of ["light", "dark"] as const) {
      expect(contrastIn(theme, "foreground")).toBeGreaterThanOrEqual(7);
      expect(contrastIn(theme, "muted-foreground")).toBeGreaterThanOrEqual(4.5);
      for (const name of ["faint", "signal", "focus"]) {
        expect(contrastIn(theme, name)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test("the contrast helper agrees with the parsed hex values", () => {
    const foreground = parseHex(tokenNamed("foreground").themes.dark.hex);
    const background = parseHex(tokenNamed("background").themes.dark.hex);
    expect(
      foreground && background ? contrastRatio(foreground, background) : 0
    ).toBeCloseTo(contrastIn("dark", "foreground"), 5);
  });
});

describe("documented values match the source", () => {
  const fontSources = {
    "font-mono": {
      declaredIn: "node_modules/geist/dist/mono.js",
      wiredAs: "GeistMono.variable",
    },
    "font-sans": {
      declaredIn: "node_modules/geist/dist/sans.js",
      wiredAs: "GeistSans.variable",
    },
    "font-serif": {
      declaredIn: "lib/fonts.ts",
      wiredAs: 'variable: "--font-instrument-serif"',
    },
    "font-signature": {
      declaredIn: "lib/fonts.ts",
      wiredAs: 'variable: "--font-signature-script"',
    },
  } as const satisfies Record<
    FontClassName,
    { declaredIn: string; wiredAs: string }
  >;

  test("every documented font variable is declared by its loader, wired in lib/fonts.ts and mapped by the theme", async () => {
    const fonts = await readProjectFile("lib/fonts.ts");
    const declarations = await Promise.all(
      fontFamilySpecs.map((font) =>
        readProjectFile(fontSources[font.className].declaredIn)
      )
    );
    for (const [index, font] of fontFamilySpecs.entries()) {
      expect(declarations[index]).toContain(`variable: "${font.sourceVar}"`);
      expect(fonts).toContain(fontSources[font.className].wiredAs);
      expect(globals.theme.get(font.cssVar)).toContain(
        `var(${font.sourceVar})`
      );
    }
  });

  test("the font aliases all point at the serif", () => {
    for (const alias of fontAliasNames) {
      expect(globals.theme.get(`--font-${alias}`)).toBe("var(--font-serif)");
    }
  });

  test("the spacing table follows the 4px scale", () => {
    for (const step of spacingSpecs) {
      expect(Number(step.step) * 4).toBe(step.px);
    }
  });

  test("the type scale reads its sizes from the theme", () => {
    const tokens = system.typeScale.flatMap((step) =>
      step.token ? [step] : []
    );
    expect(tokens.map((step) => step.token?.name)).toEqual(
      typeTokenSpecs.map(({ name }) => name)
    );
    expect(
      themeNamesWith("--text-").filter((name) => !name.slice(2).includes("--"))
    ).toEqual(typeTokenSpecs.map(({ name }) => `--text-${name}`));
    const maxima = tokens.map((step) => {
      expect(step.size).toMatch(/^\d+-\d+$/u);
      return Number(step.size.split("-")[1]);
    });
    expect(maxima).toEqual(maxima.toSorted((a, b) => b - a));
    const hero = tokens.find((step) => step.token?.name === "hero");
    expect(hero?.detail).toBe("0.92 line height, -0.035em tracking");
  });

  test("utility summaries quote the values the CSS defines", () => {
    const facts: readonly (readonly [string, string, string])[] = [
      ["grain", "5% light", "overlay"],
      ["hatch", "6px", "transparent 1px 6px"],
      ["blueprint-dots", "24px", "var(--grid-size, 24px)"],
      ["hazard-stripe", "5px", "transparent 1px 5px"],
      ["min-h-hero", "8rem", "100svh - 8rem"],
      ["object-portrait", "50% 32%", "object-position: 50% 32%"],
    ];
    for (const [name, summaryFact, cssFact] of facts) {
      expect(utilityNamed(name)?.summary).toContain(summaryFact);
      expect(utilityCss(name)).toContain(cssFact);
    }
    const sizes = [
      ["label", "11", "font-size: 0.6875rem", "letter-spacing: 0.14em"],
      ["spaced", "12", "font-size: 0.75rem", "letter-spacing: 0.32em"],
    ] as const;
    for (const [name, size, fontSize, tracking] of sizes) {
      const step = system.typeScale.find(({ className }) => className === name);
      expect(step?.size).toBe(size);
      expect(utilityCss(name)).toContain(fontSize);
      expect(utilityCss(name)).toContain(tracking);
    }
    expect(globalsSource).toContain("translateY(0.5rem)");
  });

  test("every animation reads its timing from its CSS and uses a documented easing", () => {
    const timed = system.utilities.filter((utility) => utility.timing);
    const timedNames: string[] = timed.map(({ name }) => name);
    expect(timedNames.toSorted()).toEqual(
      [
        "burst-dot",
        "clip-reveal",
        "count-roll",
        "draw-in",
        "guide-draw",
        "ink-underline",
        "mask-up",
        "pop-in",
        "rise-in",
        "settle-in",
        "signature-write",
      ].toSorted()
    );
    const easingNames = new Set<string>(easingSpecs.map(({ name }) => name));
    for (const utility of timed) {
      expect(easingNames.has(utility.timing?.easing ?? "")).toBe(true);
      expect(utilityCss(utility.name)).toContain(
        `${utility.timing?.ms}ms var(--ease-${utility.timing?.easing})`
      );
    }
  });

  test("the grain opacity quoted in the docs is what each theme declares", () => {
    expect(globals.root.get("--grain-opacity")).toBe("0.05");
    expect(globals.dark.get("--grain-opacity")).toBe("0.07");
  });

  test("the document grid spec matches the page frame", async () => {
    const layout = await readProjectFile("components/site/page-frame.tsx");
    const classNames = layout.split(/[\s"]+/u);
    for (const className of documentGridSpec.containerClasses) {
      expect(classNames).toContain(className);
    }
    for (const gutter of documentGridSpec.gutters) {
      expect(classNames).toContain(gutter);
    }
    expect(classNames).toContain(documentGridSpec.sectionGap);
  });

  test("the container tokens are the documented ones", () => {
    expect(themeNamesWith("--container-")).toEqual(
      containerSpecs.map(({ name }) => `--container-${name}`)
    );
    expect(system.containers.map(({ name }) => name)).toEqual(
      containerSpecs.map(({ name }) => name)
    );
    for (const container of system.containers) {
      expect(container.px).toBeGreaterThan(0);
    }
  });

  test("durations are named by their class and ascend", () => {
    for (const duration of durationSpecs) {
      expect(duration.className).toBe(`duration-${duration.ms}`);
    }
    expect(durationSpecs.map(({ ms }) => ms)).toEqual(
      durationSpecs.map(({ ms }) => ms).toSorted((a, b) => a - b)
    );
  });

  test("every easing in the theme is documented", () => {
    expect(themeNamesWith("--ease-").toSorted()).toEqual(
      easingSpecs.map(({ name }) => `--ease-${name}`).toSorted()
    );
  });

  test("every font variable in the theme is documented", () => {
    expect(themeNamesWith("--font-").toSorted()).toEqual(
      [
        ...fontFamilySpecs.map(({ cssVar }) => cssVar),
        ...fontAliasNames.map((name) => `--font-${name}`),
      ].toSorted()
    );
  });

  test("the reduced-motion rule is declared in globals.css", () => {
    const [rule] = findRules(globals.rules, (candidate) =>
      candidate.header.startsWith("@media (prefers-reduced-motion: reduce)")
    );
    expect(rule?.body).toContain("animation-duration: 0.01ms");
  });

  test("radius steps all derive from the radius base", () => {
    expect(system.radius.base).toBe("0.25rem");
    expect(system.radius.steps.map((step) => [step.name, step.px])).toEqual([
      ["sm", 2],
      ["md", 3],
      ["lg", 4],
      ["pill", 999],
    ]);
    expect(
      themeNamesWith("--radius-").map((name) => name.slice("--radius-".length))
    ).toEqual([...radiusStepNames]);
  });
});

describe("design.md", () => {
  test("docs/design.md is the current generated output", async () => {
    const committed = await readProjectFile(designMarkdownPath);
    const generated = loadDesignMarkdown(projectRoot);
    expect(
      committed === generated
        ? "in sync"
        : "stale: run `bun run design:md` and commit docs/design.md"
    ).toBe("in sync");
  });

  test("it follows the DESIGN.md format with every color token in both themes", () => {
    const markdown = renderDesignMarkdown(system);
    expect(markdown.startsWith("---\nversion: alpha\n")).toBe(true);
    const headings = markdown
      .split("\n")
      .filter((line) => line.startsWith("## "));
    expect(headings).toEqual([
      "## Overview",
      "## Colors",
      "## Typography",
      "## Layout",
      "## Shapes",
      "## Components",
      "## Motion",
      "## Do's and Don'ts",
    ]);
    for (const token of paletteColors(system)) {
      expect(markdown).toContain(
        `\n  ${token.name}: "${token.themes.dark.hex}"`
      );
      expect(markdown).toContain(
        `\n  ${token.name}-light: "${token.themes.light.hex}"`
      );
    }
  });

  test("it carries no trace of the retired dossier direction", () => {
    const markdown = renderDesignMarkdown(system).toLowerCase();
    for (const retired of [
      "paper",
      "clay",
      "companion",
      "cassette",
      "dossier",
      "oklch",
    ]) {
      expect(markdown).not.toContain(retired);
    }
  });

  test("the raw route serves markdown", async () => {
    const response = designMarkdownResponse();
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(await response.text()).toBe(loadDesignMarkdown(projectRoot));
  });
});
