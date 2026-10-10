import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { siteConfig } from "@/lib/site/config";

import { serializeRegistryCss, serializeRegistryCssVars } from "./css";
import {
  getInstallCommand,
  getNamespacedInstallCommand,
  getRegistriesSnippet,
} from "./install";
import { toInstalledPath, toInstalledSource } from "./installed";
import {
  getRegistryCategories,
  registry,
  registryItems,
  toCategoryLabel,
} from "./registry";
import type { RegistryFile, RegistryItem } from "./schema";

const projectRoot = process.cwd();

const standardTokens = new Set([
  "accent",
  "accent-foreground",
  "background",
  "border",
  "card",
  "card-foreground",
  "destructive",
  "foreground",
  "input",
  "muted",
  "muted-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "radius",
  "ring",
  "secondary",
  "secondary-foreground",
]);

const siteOnlyColorTokens = [
  "clay",
  "clay-deep",
  "faint",
  "graphite",
  "rule",
  "rule-strong",
  "signal-moss",
  "signal-rust",
  "signal-steel",
];

const colorUtilityPrefix =
  "(?:bg|text|border|ring|outline|fill|stroke|from|to|via|divide|decoration|caret|accent)";

const builtItemSchema = z.object({
  files: z.array(z.object({ content: z.string(), path: z.string() })),
  name: z.string(),
});

const readProjectFile = (relativePath: string) =>
  readFile(path.join(projectRoot, relativePath), "utf-8");

const readBuiltItem = async (item: RegistryItem) => {
  const builtPath = `public/r/${item.name}.json`;
  if (!existsSync(path.join(projectRoot, builtPath))) {
    return null;
  }
  return builtItemSchema.parse(JSON.parse(await readProjectFile(builtPath)));
};

const fixtures = await Promise.all(
  registryItems.map(async (item) => ({
    built: await readBuiltItem(item),
    demoSource: await readProjectFile(
      `components/registry-docs/demos/${item.name}.tsx`
    ),
    item,
    sources: await Promise.all(
      item.files.map(async (file) => ({
        file,
        source: await readProjectFile(file.path),
      }))
    ),
  }))
);

const collectMatches = (
  source: string,
  pattern: RegExp,
  extract: (raw: string) => string
) => [...source.matchAll(pattern)].map((match) => extract(match[0]));

const importSpecifiers = (source: string) =>
  collectMatches(source, /from\s+["'][^"']+["']/gu, (raw) =>
    raw.slice(raw.search(/["']/u) + 1, -1)
  );

const usedVariables = (source: string) =>
  collectMatches(source, /var\(--[a-z0-9-]+/gu, (raw) => raw.slice(6));

const declaredVariables = (source: string) =>
  collectMatches(source, /--[a-z0-9-]+(?=["']?\s*:)/gu, (raw) => raw.slice(2));

const registryItemUrl = (name: string) => `${siteConfig.url}/r/${name}.json`;

const installedFiles = (item: RegistryItem): RegistryFile[] => [
  ...item.files,
  ...item.registryDependencies.flatMap((dependency) => {
    const dependencyItem = registryItems.find(
      (entry) => registryItemUrl(entry.name) === dependency
    );
    return dependencyItem ? installedFiles(dependencyItem) : [];
  }),
];

const hasFileAt = (resolvedPath: string, item: RegistryItem) =>
  installedFiles(item).some((file) => file.path.startsWith(`${resolvedPath}.`));

const isInstalledSibling = (specifier: string, item: RegistryItem) =>
  specifier.startsWith(`@/registry/${registry.name}/`) &&
  hasFileAt(specifier.replace("@/", ""), item);

const isRelativeSibling = (
  specifier: string,
  importer: string,
  item: RegistryItem
) =>
  specifier.startsWith(".") &&
  hasFileAt(path.posix.join(path.posix.dirname(importer), specifier), item);

const packageName = (dependency: string) => {
  const versionSeparator = dependency.lastIndexOf("@");
  return versionSeparator > 0
    ? dependency.slice(0, versionSeparator)
    : dependency;
};

const isDeclaredPackage = (specifier: string, item: RegistryItem) =>
  item.dependencies.some((dependency) => {
    const name = packageName(dependency);
    return specifier === name || specifier.startsWith(`${name}/`);
  });

describe("registry.json", () => {
  test("parses and matches the site identity", () => {
    expect(registry.homepage).toBe(siteConfig.url);
    expect(`@${registry.name}`).toBe(siteConfig.registryNamespace);
    expect(registryItems.length).toBeGreaterThanOrEqual(4);
  });

  test("item names are unique", () => {
    const names = registryItems.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("registry dependencies are URLs of items in this registry", () => {
    const urls = new Set(
      registryItems.map((item) => registryItemUrl(item.name))
    );
    for (const item of registryItems) {
      for (const dependency of item.registryDependencies) {
        expect(
          urls.has(dependency),
          `${item.name} depends on ${dependency}`
        ).toBe(true);
      }
    }
  });

  test("every item carries title, description, categories and file targets", () => {
    for (const item of registryItems) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.categories.length).toBeGreaterThan(0);
      for (const file of item.files) {
        expect(file.target).toBeDefined();
      }
    }
  });

  test("every referenced file, example and demo exists", () => {
    for (const { demoSource, item } of fixtures) {
      for (const file of item.files) {
        expect(existsSync(path.join(projectRoot, file.path))).toBe(true);
      }
      for (const example of item.meta.docs.examples) {
        expect(existsSync(path.join(projectRoot, example.file))).toBe(true);
      }
      expect(demoSource).toContain("export const Demo");
      expect(demoSource).toContain("export const Thumbnail");
    }
  });
});

describe("registry sources stay portable", () => {
  test("only import react, declared packages, shadcn utils or sibling files", () => {
    for (const { item, sources } of fixtures) {
      for (const { file, source } of sources) {
        for (const specifier of importSpecifiers(source)) {
          const allowed =
            specifier === "react" ||
            specifier === "@/lib/utils" ||
            isDeclaredPackage(specifier, item) ||
            isInstalledSibling(specifier, item) ||
            isRelativeSibling(specifier, file.path, item);
          expect(allowed, `${file.path} imports ${specifier}`).toBe(true);
        }
      }
    }
  });

  test("every non-standard CSS variable is declared by the item", () => {
    for (const { item, sources } of fixtures) {
      const shipped = new Set([
        ...Object.keys(item.cssVars?.light ?? {}),
        ...Object.keys(item.cssVars?.dark ?? {}),
      ]);
      for (const { file, source } of sources) {
        const declaredInFile = new Set(declaredVariables(source));
        for (const name of usedVariables(source)) {
          const resolved =
            standardTokens.has(name) ||
            declaredInFile.has(name) ||
            shipped.has(name);
          expect(resolved, `${file.path} uses var(--${name})`).toBe(true);
        }
      }
    }
  });

  test("site only color utilities are shipped through cssVars.theme", () => {
    for (const { item, sources } of fixtures) {
      const themeVars = item.cssVars?.theme ?? {};
      for (const { file, source } of sources) {
        for (const token of siteOnlyColorTokens) {
          const utility = new RegExp(
            `\\b${colorUtilityPrefix}-${token}(?![a-z-])`,
            "u"
          );
          if (utility.test(source)) {
            expect(
              themeVars[`color-${token}`],
              `${file.path} uses a ${token} color utility`
            ).toBeDefined();
          }
        }
      }
    }
  });

  test("the same CSS variable has one value across items", () => {
    const seen = new Map<string, string>();
    for (const item of registryItems) {
      for (const group of ["theme", "light", "dark"] as const) {
        for (const [name, value] of Object.entries(
          item.cssVars?.[group] ?? {}
        )) {
          const key = `${group}:${name}`;
          expect(seen.get(key) ?? value, key).toBe(value);
          seen.set(key, value);
        }
      }
    }
  });
});

describe("built registry", () => {
  test("public/r matches the sources when it has been built", () => {
    for (const { built, item, sources } of fixtures) {
      if (!built) {
        continue;
      }
      expect(built.name).toBe(item.name);
      for (const { file, source } of sources) {
        const builtFile = built.files.find((entry) => entry.path === file.path);
        expect(builtFile?.content, `${item.name} ${file.path}`).toBe(source);
      }
    }
  });
});

describe("registry helpers", () => {
  test("build install commands for the URL and namespace forms", () => {
    expect(getInstallCommand("bun", "technical-grid")).toBe(
      `bunx --bun shadcn@latest add ${siteConfig.url}/r/technical-grid.json`
    );
    expect(getNamespacedInstallCommand("npm", "technical-grid")).toBe(
      "npx shadcn@latest add @ivan/technical-grid"
    );
    expect(JSON.parse(getRegistriesSnippet())).toEqual({
      registries: { "@ivan": `${siteConfig.url}/r/{name}.json` },
    });
  });

  test("rewrite registry imports to the paths shadcn installs", () => {
    expect(
      toInstalledSource(
        'import { useThing } from "@/registry/ivan/hooks/use-thing";\nimport { Thing } from "@/registry/ivan/ui/thing";'
      )
    ).toBe(
      'import { useThing } from "@/hooks/use-thing";\nimport { Thing } from "@/components/ui/thing";'
    );
    expect(
      toInstalledPath({
        path: "registry/ivan/hooks/use-thing.ts",
        target: "@hooks/use-thing.ts",
        type: "registry:hook",
      })
    ).toBe("hooks/use-thing.ts");
  });

  test("serialize css rules and variables", () => {
    const item = registryItems.find((entry) => entry.css);
    expect(item?.css).toBeDefined();
    expect(serializeRegistryCss(item?.css ?? {})).toContain(
      "@keyframes technical-grid-scan-y {"
    );
    expect(serializeRegistryCssVars({ dark: { clay: "red" } })).toBe(
      ".dark {\n  --clay: red;\n}"
    );
  });

  test("group categories with counts", () => {
    const categories = getRegistryCategories();
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(category.label).toBe(toCategoryLabel(category.id));
      expect(category.count).toBeGreaterThan(0);
    }
  });
});
