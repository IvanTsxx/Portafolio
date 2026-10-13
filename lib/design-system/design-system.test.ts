import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseGlobalsCss } from "./css-parse";
import { renderDesignMarkdown } from "./design-md";
import { designMarkdownPath, globalsCssPath, loadDesignMarkdown } from "./load";
import { designMarkdownResponse } from "./markdown-response";
import { buildDesignSystem, findMissingTokens, tokenReferences } from "./model";
import {
  colorSpecs,
  documentGridSpec,
  durationSpecs,
  fontFamilySpecs,
  spacingSpecs,
  typeScaleSpecs,
  utilitySpecs,
} from "./specs";

const projectRoot = process.cwd();

const readProjectFile = (relativePath: string) =>
  readFile(path.join(projectRoot, relativePath), "utf-8");

const globalsSource = await readProjectFile(globalsCssPath);
const globals = parseGlobalsCss(globalsSource);

describe("tokens used in the doc exist in globals.css", () => {
  test("every documented token resolves in :root, @theme or @utility", () => {
    expect(findMissingTokens(globals, tokenReferences())).toEqual([]);
  });

  test("reports a documented token that globals.css does not declare", () => {
    const missing = findMissingTokens(globals, [
      { name: "--paper", source: "root" },
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
    const withoutClay = parseGlobalsCss(
      globalsSource.replace("  --clay:", "  --clay-gone:")
    );
    expect(() => buildDesignSystem(withoutClay)).toThrow("root:--clay");
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
    const documentedUtilities = new Set<string>(
      utilitySpecs.map(({ name }) => name)
    );
    expect(
      [...globals.utilities.keys()].filter(
        (name) => !documentedUtilities.has(name)
      )
    ).toEqual([]);
  });
});

describe("documented values match the source", () => {
  const system = buildDesignSystem(globals);

  test("every documented font variable is loaded in lib/fonts.ts and mapped by the theme", async () => {
    const fonts = await readProjectFile("lib/fonts.ts");
    for (const font of fontFamilySpecs) {
      expect(fonts).toContain(`variable: "${font.sourceVar}"`);
      expect(globals.theme.get(font.cssVar)).toContain(
        `var(${font.sourceVar})`
      );
    }
  });

  test("the spacing table follows the 4px scale", () => {
    for (const step of spacingSpecs) {
      expect(Number(step.step) * 4).toBe(step.px);
    }
  });

  test("utility summaries quote the values the CSS defines", () => {
    const facts: readonly (readonly [string, string, string])[] = [
      ["label", "10px", "font-size: 0.625rem"],
      ["display", "0.88", "line-height: 0.88"],
      ["min-h-below-header", "48px", "--spacing(12)"],
      ["h-below-header", "48px", "--spacing(12)"],
    ];
    for (const [name, summaryFact, cssFact] of facts) {
      const utility = system.utilities.find((entry) => entry.name === name);
      expect(utility?.summary).toContain(summaryFact);
      expect(utility?.css).toContain(cssFact);
    }
    const labelStep = typeScaleSpecs.find(
      ({ className }) => className === "label"
    );
    expect(labelStep?.size).toBe("10");
  });

  test("the document grid spec matches the dossier sheet", async () => {
    const [layout, css] = await Promise.all([
      readProjectFile("components/site/dossier.tsx"),
      readProjectFile("app/globals.css"),
    ]);
    for (const className of documentGridSpec.containerClasses) {
      expect(layout.split(/[\s"]+/u)).toContain(className);
    }
    expect(layout).toContain(documentGridSpec.gutter);
    expect(layout).toContain(documentGridSpec.sectionGap);
    expect(layout).toContain(documentGridSpec.sheetInset);
    expect(css).toContain(
      `--container-column: ${documentGridSpec.columnWidth}`
    );
  });

  test("every documented duration class is used by the site", async () => {
    const sources = await Promise.all(
      [
        "components/profile/portrait-plate.tsx",
        "components/profile/how-i-work/work-stages.tsx",
        "components/lab/experiment-card.tsx",
        "components/content/note-row.tsx",
        "components/site/styles.ts",
        "components/ui/sheet.tsx",
      ].map(readProjectFile)
    );
    const combined = sources.join("\n");
    for (const duration of durationSpecs) {
      expect(combined).toContain(duration.className);
    }
  });

  test("the reduced-motion rule is captured from globals.css", () => {
    expect(system.reducedMotionCss).toContain("prefers-reduced-motion: reduce");
    expect(system.reducedMotionCss).toContain("animation-duration: 0.01ms");
  });

  test("radius steps all derive from the radius base", () => {
    expect(system.radius.base).toBe("0");
    expect(system.radius.steps.map((step) => step.px)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("design.md", () => {
  test("docs/design.md is the current generated output", async () => {
    const committed = await readProjectFile(designMarkdownPath);
    const generated = await loadDesignMarkdown(projectRoot);
    expect(
      committed === generated
        ? "in sync"
        : "stale: run `bun run design:md` and commit docs/design.md"
    ).toBe("in sync");
  });

  test("it follows the DESIGN.md format with every color token", () => {
    const markdown = renderDesignMarkdown(buildDesignSystem(globals));
    expect(markdown.startsWith("---\nversion: alpha\n")).toBe(true);
    const headings = markdown
      .split("\n")
      .filter((line) => line.startsWith("## "));
    expect(headings).toEqual([
      "## Overview",
      "## Colors",
      "## Typography",
      "## Layout",
      "## Elevation & Depth",
      "## Shapes",
      "## Components",
      "## Do's and Don'ts",
    ]);
    for (const token of buildDesignSystem(globals).colors.filter(
      (color) => color.alias === null
    )) {
      expect(markdown).toContain(`\n  ${token.name}: "#`);
    }
  });

  test("the raw route serves markdown", async () => {
    const response = await designMarkdownResponse();
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(await response.text()).toBe(await loadDesignMarkdown(projectRoot));
  });
});
