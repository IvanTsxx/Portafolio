import { readFileSync } from "node:fs";
import path from "node:path";

import { serializeRegistryCss, serializeRegistryCssVars } from "./css";
import { highlightCode } from "./highlight";
import type { CodeLanguage, HighlightedLine } from "./highlight";
import { getLanguage, toInstalledPath, toInstalledSource } from "./installed";
import type { RegistryItem } from "./schema";

const sourcePrefix = "registry/";

const resolveSourcePath = (relativePath: string) => {
  if (!relativePath.startsWith(sourcePrefix) || relativePath.includes("..")) {
    throw new Error(
      `Registry source must live under registry/: ${relativePath}`
    );
  }
  return path.join(
    process.cwd(),
    "registry",
    relativePath.slice(sourcePrefix.length)
  );
};

export const readRegistrySource = (relativePath: string) =>
  readFileSync(resolveSourcePath(relativePath), "utf-8");

export interface HighlightedFile {
  id: string;
  installPath: string;
  label: string;
  lines: HighlightedLine[];
  source: string;
}

export const buildHighlightedFile = async (
  id: string,
  installPath: string,
  source: string,
  language: CodeLanguage
): Promise<HighlightedFile> => ({
  id,
  installPath,
  label: path.basename(installPath),
  lines: await highlightCode(source, language),
  source,
});

const buildStylesSource = (item: RegistryItem) =>
  [
    item.cssVars ? serializeRegistryCssVars(item.cssVars) : null,
    item.css ? serializeRegistryCss(item.css) : null,
  ]
    .filter((block): block is string => block !== null)
    .join("\n\n");

export const buildItemCodeFiles = async (
  item: RegistryItem
): Promise<HighlightedFile[]> => {
  const sourceFiles = await Promise.all(
    item.files.map((file) =>
      buildHighlightedFile(
        file.path,
        toInstalledPath(file),
        toInstalledSource(readRegistrySource(file.path)),
        getLanguage(file.path)
      )
    )
  );
  const stylesSource = buildStylesSource(item);
  if (stylesSource === "") {
    return sourceFiles;
  }
  return [
    ...sourceFiles,
    await buildHighlightedFile(
      "styles",
      "app/globals.css",
      stylesSource,
      "css"
    ),
  ];
};
