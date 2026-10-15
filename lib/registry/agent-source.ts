import { readdir } from "node:fs/promises";
import path from "node:path";

export const agentSourceDirectory = "components/agents";
export const agentRegistryDirectory = "registry/ivan/components/agent";

export const agentSourceExclusions = [] as const;

export const agentRegistryOnlyFiles = ["types.ts"] as const;

const sourceExtensions: ReadonlySet<string> = new Set([".ts", ".tsx"]);
const excludedFiles: ReadonlySet<string> = new Set(agentSourceExclusions);

export const listAgentSourceFiles = async (projectRoot: string) => {
  const entries = await readdir(path.join(projectRoot, agentSourceDirectory), {
    recursive: true,
  });
  return entries
    .flatMap((entry) => {
      const relativePath = entry.split(path.sep).join("/");
      const isSource =
        sourceExtensions.has(path.extname(relativePath)) &&
        !relativePath.endsWith(".test.ts") &&
        !excludedFiles.has(relativePath);
      return isSource ? [relativePath] : [];
    })
    .toSorted();
};

export const toRegistryAgentPath = (relativePath: string) =>
  `${agentRegistryDirectory}/${relativePath}`;

const siteRolesSpecifier = '"@/lib/agents/roles"';
const siteReducedMotionSpecifier = '"@/hooks/use-reduced-motion"';
const registryReducedMotionSpecifier =
  '"@/registry/ivan/hooks/use-prefers-reduced-motion"';

export const toRegistryAgentSource = (source: string, relativePath: string) => {
  const typesSpecifier = relativePath.includes("/")
    ? '"../types"'
    : '"./types"';
  return source
    .replaceAll(siteRolesSpecifier, typesSpecifier)
    .replaceAll(siteReducedMotionSpecifier, registryReducedMotionSpecifier)
    .replaceAll(/\buseReducedMotion\b/gu, "usePrefersReducedMotion");
};

const importOrReexportStatement =
  /^(?:import|export)\s[^;]*?\sfrom\s+["'][^"']+["'];?[ \t]*$/gmu;

export const normalizeAgentSource = (source: string) =>
  source
    .replaceAll(importOrReexportStatement, "")
    .replaceAll(/\s+/gu, " ")
    .trim();
