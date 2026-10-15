import { readFileSync } from "node:fs";
import path from "node:path";

import { parseGlobalsCss } from "./css-parse";
import { renderDesignMarkdown } from "./design-md";
import { buildDesignSystem } from "./model";

export const globalsCssPath = "app/globals.css";
export const designMarkdownPath = "docs/design.md";

export const loadDesignSystem = (projectRoot = process.cwd()) => {
  const source = readFileSync(path.join(projectRoot, globalsCssPath), "utf-8");
  return buildDesignSystem(parseGlobalsCss(source));
};

export const loadDesignMarkdown = (projectRoot = process.cwd()) =>
  renderDesignMarkdown(loadDesignSystem(projectRoot));
