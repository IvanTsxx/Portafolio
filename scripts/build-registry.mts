// oxlint-disable promise/prefer-await-to-then
import { promises as fs } from "node:fs";
import path from "node:path";

import { rimraf } from "rimraf";
import { registrySchema } from "shadcn/schema";
import type { Registry } from "shadcn/schema";

const REGISTRY_PATH = path.join(process.cwd(), "__registry__");
const PUBLIC_REGISTRY_PATH = path.join(process.cwd(), "public/r");
const REGISTRY_DIR = path.join(process.cwd(), "registry");

/**
 * Extract NPM dependencies from file content
 */
function extractDependencies(content: string): Set<string> {
  const dependencies = new Set<string>();

  // Match ES imports
  const importMatches = content.matchAll(
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
  );
  for (const match of importMatches) {
    const [_, importPath] = match;
    // Skip relative imports, React, Next, and registry internal imports
    if (
      importPath.startsWith(".") ||
      importPath.startsWith("@/") ||
      importPath.startsWith("@/registry/") ||
      ["react", "react-dom", "next", "use server"].includes(importPath) ||
      importPath.startsWith("next/")
    ) {
      continue;
    }
    // Extract package name
    const parts = importPath.split("/");
    const pkgName = importPath.startsWith("@")
      ? `${parts[0]}/${parts[1]}`
      : parts[0];
    dependencies.add(pkgName);
  }

  // Match require() calls
  const requireMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);
  for (const match of requireMatches) {
    const [_, importPath] = match;
    if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
      const parts = importPath.split("/");
      const pkgName = importPath.startsWith("@")
        ? `${parts[0]}/${parts[1]}`
        : parts[0];
      dependencies.add(pkgName);
    }
  }

  return dependencies;
}

/**
 * Scan a nested directory structure (blocks, app)
 * For blocks: looks for index.tsx as main file
 * For app: looks for page.tsx files
 */
async function scanNestedDirectory(
  dirName: "blocks" | "app",
  registryType: Registry["items"][number]["type"]
): Promise<Registry["items"]> {
  const items: Registry["items"] = [];
  const targetDir = path.join(REGISTRY_DIR, dirName);

  if (!(await fs.stat(targetDir).catch(() => false))) {
    return items;
  }

  // Get all item directories (those containing index.tsx or page.tsx)
  const entries = await fs.readdir(targetDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;

    const itemDir = path.join(targetDir, entry.name);
    const itemFiles = await fs.readdir(itemDir);

    const hasIndex = itemFiles.includes("index.tsx");
    const hasPage = itemFiles.includes("page.tsx");

    if (!hasIndex && !hasPage) continue;

    const mainFile = hasIndex ? "index.tsx" : "page.tsx";
    const { name } = entry;
    const mainFilePath = path.join(itemDir, mainFile);
    const content = await fs.readFile(mainFilePath, "utf-8");
    const dependencies = extractDependencies(content);

    // Determine target path based on type
    // Always use the registry author (ivantsx) as the block author for distribution
    const registryAuthor = "ivantsx";
    let targetPath = "";
    if (registryType === "registry:block") {
      // Blocks: blocks/ivantsx/hero-01/index.tsx
      targetPath = `blocks/${registryAuthor}/${entry.name}/index.tsx`;
    } else if (registryType === "registry:page") {
      // Pages: app/page-blog/page.tsx
      targetPath = `app/${entry.name}/page.tsx`;
    }

    const files: Registry["items"][number]["files"] = [
      {
        path: `${dirName}/${name}/${mainFile}`,
        target: targetPath,
        type: registryType,
      },
    ];

    // _components subdirectory
    const componentsDir = path.join(itemDir, "_components");
    if (await fs.stat(componentsDir).catch(() => null)) {
      const componentFiles = await fs.readdir(componentsDir);
      for (const cf of componentFiles) {
        if (cf.startsWith("_") || cf === "index.ts" || cf === "index.tsx")
          continue;
        if (cf.endsWith(".ts") || cf.endsWith(".tsx")) {
          files.push({
            path: `${dirName}/${name}/_components/${cf}`,
            target: `blocks/${registryAuthor}/${entry.name}/_components/${cf}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: "registry:component",
          });
        }
      }
    }

    // _actions file
    if (itemFiles.includes("_actions.ts")) {
      files.push({
        path: `${dirName}/${name}/_actions.ts`,
        target: `blocks/${registryAuthor}/${entry.name}/_actions.ts`,
        type: "registry:file",
      });
    }
    if (itemFiles.includes("_actions.tsx")) {
      files.push({
        path: `${dirName}/${name}/_actions.tsx`,
        target: `blocks/${registryAuthor}/${entry.name}/_actions.tsx`,
        type: "registry:file",
      });
    }

    // _validations file
    if (itemFiles.includes("_validations.tsx")) {
      files.push({
        path: `${dirName}/${name}/_validations.tsx`,
        target: `blocks/${registryAuthor}/${entry.name}/_validations.tsx`,
        type: "registry:file",
      });
    }

    items.push({
      dependencies: [...dependencies].toSorted(),
      description: `${name} ${registryType.replace("registry:", "")}.`,
      files,

      name,
      registryDependencies: [],
      title: name
        .split("-")
        .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
        .join(" "),
      type: registryType,
    } as Registry["items"][number]);
  }

  return items;
}

/**
 * Scan a flat directory (for hooks, lib, utils, etc.)
 */
async function scanFlatDirectory(
  dirName:
    | "components"
    | "hooks"
    | "lib"
    | "utils"
    | "types"
    | "validations"
    | "content",
  registryType: Registry["items"][number]["type"]
): Promise<Registry["items"]> {
  const items: Registry["items"] = [];
  const targetDir = path.join(REGISTRY_DIR, dirName);

  if (!(await fs.stat(targetDir).catch(() => false))) {
    return items;
  }

  const files = await fs.readdir(targetDir);

  for (const file of files) {
    if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
    if (file.startsWith("_") || file === "index.ts" || file === "index.tsx")
      continue;

    const name = file.replace(/\.tsx?$/, "");
    const content = await fs.readFile(path.join(targetDir, file), "utf-8");
    const dependencies = extractDependencies(content);

    items.push({
      dependencies: [...dependencies].toSorted(),
      description: `${name} ${registryType.replace("registry:", "")}.`,
      files: [{ path: `${dirName}/${file}`, target: "", type: registryType }],

      name,
      registryDependencies: [],
      title: name
        .split("-")
        .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
        .join(" "),
      type: registryType,
    } as Registry["items"][number]);
  }

  return items;
}

/**
 * Scan components directory (handles both flat files and nested directories)
 */
async function scanComponentsDirectory(): Promise<Registry["items"]> {
  const items: Registry["items"] = [];
  const targetDir = path.join(REGISTRY_DIR, "components");

  if (!(await fs.stat(targetDir).catch(() => false))) {
    return items;
  }

  const entries = await fs.readdir(targetDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;

    if (entry.isDirectory()) {
      const itemDir = path.join(targetDir, entry.name);
      const itemFiles = await fs.readdir(itemDir);
      const hasIndex =
        itemFiles.includes("index.tsx") || itemFiles.includes("index.ts");
      if (!hasIndex) continue;

      const mainFile = itemFiles.includes("index.tsx")
        ? "index.tsx"
        : "index.ts";
      const content = await fs.readFile(path.join(itemDir, mainFile), "utf-8");
      const dependencies = extractDependencies(content);

      const files: Registry["items"][number]["files"] = [];

      for (const cf of itemFiles) {
        if (!cf.endsWith(".ts") && !cf.endsWith(".tsx")) continue;

        files.push({
          path: `components/${entry.name}/${cf}`,
          target: "",
          type: "registry:component",
        });
      }

      items.push({
        dependencies: [...dependencies].toSorted(),
        description: `${entry.name} component.`,
        files,
        name: entry.name,
        registryDependencies: [],
        title: entry.name
          .split("-")
          .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
          .join(" "),
        type: "registry:component",
      } as Registry["items"][number]);
    } else {
      if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".ts")) continue;
      if (entry.name === "index.ts" || entry.name === "index.tsx") continue;

      const name = entry.name.replace(/\.tsx?$/, "");
      const content = await fs.readFile(
        path.join(targetDir, entry.name),
        "utf-8"
      );
      const dependencies = extractDependencies(content);

      items.push({
        dependencies: [...dependencies].toSorted(),
        description: `${name} component.`,
        files: [
          {
            path: `components/${entry.name}`,
            target: "",
            type: "registry:component",
          },
        ],
        name,
        registryDependencies: [],
        title: name
          .split("-")
          .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
          .join(" "),
        type: "registry:component",
      } as Registry["items"][number]);
    }
  }

  return items;
}

const mapFiles = (files: Registry["items"][number]["files"]) =>
  files?.map(({ content: _content, ...file }) => ({
    ...file,
    path: `registry/${file.path}`,
  })) ?? [];

export async function buildRegistry(registry: Registry) {
  let index = `/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.mts
// Do not edit this file directly.

import * as React from "react"

export const Index: Record<string, any> = {`;

  for (const item of registry.items) {
    if (!Array.isArray(item.files) || !item.files.length) {
      continue;
    }

    const mainFile =
      item.files.find((f) => f.path.endsWith("example.tsx")) ||
      item.files.find((f) => f.path.endsWith("index.tsx")) ||
      item.files.find((f) => f.path.endsWith("page.tsx")) ||
      item.files[0];

    const componentFilePath = mainFile.path;
    // We already added 'registry/' to the file path below, but in the index generation
    // the item.files still have the prefix without 'registry/' if it wasn't mutated yet?
    // Wait, let's just make sure we strip 'registry/' if it's there or just use it.
    // In buildRegistry, file.path is like "components/contribution-card/example.ts"
    const componentPath = `@/registry/${componentFilePath}`;

    index += `
  "${item.name}": {
    name: "${item.name}",
    description: "${item.description ?? ""}",
    type: "${item.type}",
    files: [${item.files.map(
      (file) => `{
      path: "registry/${file.path}",
      type: "${file.type}",
      target: "${file.target ?? ""}",
    }`
    )}],
    component: React.lazy(async () => {
      const mod = await import("${componentPath}")
      const exportName = Object.keys(mod).find((key) => typeof mod[key] === "function" || typeof mod[key] === "object") || "${item.name}"
      return { default: mod.default || mod[exportName] }
    }),
    categories: ${JSON.stringify(item.categories ?? [])},
    meta: ${JSON.stringify(item.meta ?? {})},
  },`;
  }

  index += `
}`;

  const registryJSON = JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      homepage: "https://bongi.dev",
      items: registry.items.map((item) => ({
        ...item,
        author: item.author ?? "ivantsx",
        files: mapFiles(item.files ?? []),
      })),
      name: "ivantsx",
    },
    null,
    2
  );

  // public/r/registry.json
  await fs.mkdir(PUBLIC_REGISTRY_PATH, { recursive: true });
  await rimraf(PUBLIC_REGISTRY_PATH);
  await fs.mkdir(PUBLIC_REGISTRY_PATH, { recursive: true });
  await fs.writeFile(
    path.join(PUBLIC_REGISTRY_PATH, "registry.json"),
    registryJSON,
    "utf-8"
  );

  // public/r/<name>.json — individual item files (no content field)
  for (const item of registry.items) {
    const itemJSON = JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        ...item,
        author: item.author ?? "ivantsx",
        files: mapFiles(item.files ?? []),
      },
      null,
      2
    );
    await fs.writeFile(
      path.join(PUBLIC_REGISTRY_PATH, `${item.name}.json`),
      itemJSON,
      "utf-8"
    );
  }

  // __registry__/index.tsx
  await fs.mkdir(REGISTRY_PATH, { recursive: true });
  await rimraf(path.join(REGISTRY_PATH, "index.tsx"));
  await fs.writeFile(path.join(REGISTRY_PATH, "index.tsx"), index, "utf-8");
}

try {
  console.log("Building registry...");

  // Scan all directories
  const [
    blocks,
    appDirs,
    components,
    hooks,
    lib,
    utils,
    types,
    validations,
    contentDirs,
  ] = await Promise.all([
    scanNestedDirectory("blocks", "registry:block"),
    scanNestedDirectory("app", "registry:page"),
    scanComponentsDirectory(),
    scanFlatDirectory("hooks", "registry:hook"),
    scanFlatDirectory("lib", "registry:lib"),
    scanFlatDirectory("utils", "registry:lib"),
    scanFlatDirectory("types", "registry:file"),
    scanFlatDirectory("validations", "registry:file"),
    scanFlatDirectory("content", "registry:file"),
  ]);

  // Merge items, removing duplicates by name
  const itemsMap = new Map<string, Registry["items"][number]>();
  for (const item of [
    ...blocks,
    ...appDirs,
    ...components,
    ...hooks,
    ...lib,
    ...utils,
    ...types,
    ...validations,
    ...contentDirs,
  ]) {
    if (!itemsMap.has(item.name)) {
      itemsMap.set(item.name, item);
    }
  }

  const registry: Registry = {
    homepage: "https://bongi.dev",
    items: [...itemsMap.values()],
    name: "ivantsx",
  };

  const result = registrySchema.safeParse(registry);

  if (!result.success) {
    console.error(result.error);
    process.exit(1);
  }

  await buildRegistry(result.data);

  console.log("Done! ✅");
} catch (error) {
  console.error(error);
  process.exit(1);
}
