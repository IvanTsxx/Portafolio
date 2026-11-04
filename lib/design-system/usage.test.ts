import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { findRules, parseGlobalsCss } from "./css-parse";
import { globalsCssPath } from "./load";
import {
  colorSpecs,
  componentSpecs,
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

const projectRoot = process.cwd();

const siteGlob = new Bun.Glob(
  "{app,components,lib,hooks,content,registry}/**/*.{ts,tsx,mdx}"
);

const isSiteSource = (file: string) =>
  !(
    file.startsWith("components/design-system/") ||
    file.startsWith("lib/design-system/") ||
    file.includes(".test.")
  );

const readProjectFile = (relativePath: string) =>
  readFile(path.join(projectRoot, relativePath), "utf-8");

const globals = parseGlobalsCss(await readProjectFile(globalsCssPath));

const scannedFiles = await Array.fromAsync(siteGlob.scan({ cwd: projectRoot }));

const siteFiles = await Promise.all(
  scannedFiles
    .filter(isSiteSource)
    .map(async (file) => ({ file, text: await readProjectFile(file) }))
);

const stylesheetText = [
  ...findRules(globals.rules, (rule) => rule.header === "@layer base").map(
    (rule) => rule.body
  ),
  ...[...globals.utilities.values()].map((rule) => rule.body),
].join("\n");

const siteText = [...siteFiles.map(({ text }) => text), stylesheetText].join(
  "\n"
);

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);

const classPattern = (prefixes: string, name: string) =>
  new RegExp(`(?<![\\w-])(?:${prefixes})-${escapeRegExp(name)}(?![\\w-])`, "u");

const colorPrefixes =
  "bg|text|border|fill|stroke|ring|outline|decoration|divide|from|to|via|accent|caret|placeholder";

const utilityPattern = (name: string) => {
  if (name === "stagger-*") {
    return /(?<![\w.$-])stagger-\d/u;
  }
  if (name === "wait-*") {
    return /(?<![\w.$-])wait-\d/u;
  }
  return new RegExp(`(?<![\\w.$-])${escapeRegExp(name)}(?![\\w-])`, "u");
};

const unused = (names: readonly string[], isUsed: (name: string) => boolean) =>
  names.filter((name) => !isUsed(name));

const spacingPattern = (step: string) =>
  new RegExp(
    `(?<![\\w-])-?(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-${escapeRegExp(step)}(?![\\w.-])`,
    "u"
  );

describe("everything the design system documents is used by the site", () => {
  test("colors", () => {
    expect(
      unused(
        colorSpecs.map(({ name }) => name),
        (name) =>
          classPattern(colorPrefixes, name).test(siteText) ||
          new RegExp(
            `(?<![\\w-])--(?:color-)?${escapeRegExp(name)}(?![\\w-])`,
            "u"
          ).test(siteText)
      )
    ).toEqual([]);
  });

  test("utilities", () => {
    expect(
      unused(
        [...utilitySpecs.map(({ name }) => name), ...typeUtilityNames],
        (name) => utilityPattern(name).test(siteText)
      )
    ).toEqual([]);
  });

  test("easings, durations and containers", () => {
    expect(
      unused(
        easingSpecs.map(({ name }) => name),
        (name) =>
          classPattern("ease", name).test(siteText) ||
          siteText.includes(`var(--ease-${name})`)
      )
    ).toEqual([]);
    expect(
      unused(
        durationSpecs.map(({ className }) => className),
        (className) =>
          new RegExp(`(?<![\\w-])${className}(?![\\w-])`, "u").test(siteText)
      )
    ).toEqual([]);
    expect(
      unused(
        containerSpecs.map(({ name }) => name),
        (name) => classPattern("max-w", name).test(siteText)
      )
    ).toEqual([]);
  });

  test("type tokens, font families and radius steps", () => {
    expect(
      unused(
        typeTokenSpecs.map(({ name }) => name),
        (name) => classPattern("text", name).test(siteText)
      )
    ).toEqual([]);
    expect(
      unused(
        [
          ...fontFamilySpecs.map(({ cssVar }) => cssVar.replace("--font-", "")),
          ...fontAliasNames,
        ],
        (name) =>
          classPattern("font", name).test(siteText) ||
          siteText.includes(`var(--font-${name})`)
      )
    ).toEqual([]);
    expect(
      unused(radiusStepNames, (name) =>
        new RegExp(
          `(?<![\\w-])rounded(?:-[tblrse]{1,2})?-${name}(?![\\w-])`,
          "u"
        ).test(siteText)
      )
    ).toEqual([]);
  });

  test("spacing steps and the page grid", () => {
    expect(
      unused(
        spacingSpecs.map(({ step }) => step),
        (step) => spacingPattern(step).test(siteText)
      )
    ).toEqual([]);
    expect(
      unused(
        [
          documentGridSpec.measure.className,
          documentGridSpec.sectionGap,
          ...documentGridSpec.gutters.map(
            (gutter) => gutter.split(":").at(-1) ?? gutter
          ),
        ],
        (className) =>
          new RegExp(
            `(?<![\\w-])${escapeRegExp(className)}(?![\\w-])`,
            "u"
          ).test(siteText)
      )
    ).toEqual([]);
  });

  test("components exist and are used outside their own file", async () => {
    const problems = await Promise.all(
      componentSpecs.map(async (spec) => {
        const source = await readProjectFile(spec.file);
        const isExported = new RegExp(
          `export (?:const|function) ${spec.symbol}\\b`,
          "u"
        ).test(source);
        const isUsed = siteFiles.some(
          ({ file, text }) =>
            file !== spec.file &&
            new RegExp(`(?<![\\w-])${spec.symbol}(?![\\w-])`, "u").test(text)
        );
        return isExported && isUsed ? [] : [spec.name];
      })
    );
    expect(problems.flat()).toEqual([]);
  });
});
