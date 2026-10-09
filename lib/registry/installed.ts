import path from "node:path";

import type { CodeLanguage } from "./highlight";
import { registry } from "./registry";
import type { RegistryFile } from "./schema";

const installedImportRewrites = [
  [`@/registry/${registry.name}/ui/`, "@/components/ui/"],
  [`@/registry/${registry.name}/hooks/`, "@/hooks/"],
  [`@/registry/${registry.name}/lib/`, "@/lib/"],
] as const;

const targetPlaceholders = [
  ["@ui/", "components/ui/"],
  ["@hooks/", "hooks/"],
  ["@lib/", "lib/"],
  ["@components/", "components/"],
] as const;

export const toInstalledSource = (source: string) => {
  let installed = source;
  for (const [from, to] of installedImportRewrites) {
    installed = installed.replaceAll(from, to);
  }
  return installed;
};

export const toInstalledPath = (file: RegistryFile) => {
  const target = file.target ?? path.basename(file.path);
  const match = targetPlaceholders.find(([placeholder]) =>
    target.startsWith(placeholder)
  );
  return match ? target.replace(match[0], match[1]) : target;
};

const languageByExtension = new Map<string, CodeLanguage>([
  [".css", "css"],
  [".json", "json"],
  [".ts", "ts"],
  [".tsx", "tsx"],
]);

export const getLanguage = (filePath: string): CodeLanguage =>
  languageByExtension.get(path.extname(filePath)) ?? "tsx";
