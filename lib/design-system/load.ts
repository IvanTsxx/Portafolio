import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseGlobalsCss } from "./css-parse";
import { renderDesignMarkdown } from "./design-md";
import { buildDesignSystem } from "./model";

export const globalsCssPath = "app/globals.css";
export const designMarkdownPath = "docs/design.md";

export const loadDesignSystem = async (projectRoot = process.cwd()) => {
  const source = await readFile(
    path.join(projectRoot, globalsCssPath),
    "utf-8"
  );
  return buildDesignSystem(parseGlobalsCss(source));
};

export const loadDesignMarkdown = async (projectRoot = process.cwd()) =>
  renderDesignMarkdown(await loadDesignSystem(projectRoot));
