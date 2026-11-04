import path from "node:path";

import type { CodeLanguage } from "./highlight";
import { registry } from "./registry";
import type { RegistryFile } from "./schema";

const installedImportRewrites = [
  [`@/registry/${registry.name}/ui/`, "@/components/ui/"],
  [`@/registry/${registry.name}/components/`, "@/components/"],
  [`@/registry/${registry.name}/hooks/`, "@/hooks/"],
  [`@/registry/${registry.name}/lib/`, "@/lib/"],
] as const;

export const docsShimRewrites = [
  [
    '"@/components/registry-docs/demos/orbit-dust-view"',
    '"@/components/orbit-dust/orbit-dust"',
  ],
  [
    '"@/components/registry-docs/demos/lunar-dither-view"',
    '"@/components/lunar-dither/lunar-dither"',
  ],
  [
    '"@/components/registry-docs/demos/dust-portrait-view"',
    '"@/components/dust-portrait/dust-portrait"',
  ],
  [
    '"@/components/registry-docs/demos/blast-print-view"',
    '"@/components/blast-print/blast-print"',
  ],
  [
    '"@/components/registry-docs/demos/signal-tear-view"',
    '"@/components/signal-tear/signal-tear"',
  ],
  [
    '"@/components/registry-docs/demos/speed-smear-view"',
    '"@/components/speed-smear/speed-smear"',
  ],
  [
    '"@/components/registry-docs/demos/storm-print-view"',
    '"@/components/storm-print/storm-print"',
  ],
] as const;

const targetPlaceholders = [
  ["@ui/", "components/ui/"],
  ["@hooks/", "hooks/"],
  ["@lib/", "lib/"],
  ["@components/", "components/"],
] as const;

export const toInstalledSource = (source: string) => {
  let installed = source;
  for (const [from, to] of [...installedImportRewrites, ...docsShimRewrites]) {
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
