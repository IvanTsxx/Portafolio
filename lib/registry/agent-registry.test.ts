import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { agentActions, agentProfiles, agentRoles } from "@/lib/agents/roles";
import * as registryOutfit from "@/registry/ivan/components/agent/outfit";
import * as registryTypes from "@/registry/ivan/components/agent/types";

import {
  agentRegistryDirectory,
  agentRegistryOnlyFiles,
  agentSourceDirectory,
  listAgentSourceFiles,
  normalizeAgentSource,
  toRegistryAgentPath,
  toRegistryAgentSource,
} from "./agent-source";
import { toInstalledSource } from "./installed";
import { getRegistryItem } from "./registry";

const projectRoot = process.cwd();

const readProjectFile = (relativePath: string) =>
  readFile(path.join(projectRoot, relativePath), "utf-8");

const importSpecifiers = (source: string) =>
  [...source.matchAll(/from\s+["'][^"']+["']/gu)]
    .map(([statement]) => statement.slice(statement.search(/["']/u) + 1, -1))
    .toSorted();

const sourceFiles = await listAgentSourceFiles(projectRoot);

const listRegistryFiles = async () => {
  const entries = await readdir(
    path.join(projectRoot, agentRegistryDirectory),
    {
      recursive: true,
    }
  );
  return entries
    .map((entry) => entry.split(path.sep).join("/"))
    .filter((entry) => /\.tsx?$/u.test(entry))
    .toSorted();
};

describe("agent registry copy", () => {
  test("mirrors every file of components/agents except the site lineup", async () => {
    const registryFiles = await listRegistryFiles();
    expect(registryFiles).toEqual(
      [...sourceFiles, ...agentRegistryOnlyFiles].toSorted()
    );
  });

  test("keeps the same code and imports as the source after the portable rewrites", async () => {
    await Promise.all(
      sourceFiles.map(async (relativePath) => {
        const [source, copy] = await Promise.all([
          readProjectFile(`${agentSourceDirectory}/${relativePath}`),
          readProjectFile(toRegistryAgentPath(relativePath)),
        ]);
        const expected = toRegistryAgentSource(source, relativePath);
        expect(
          normalizeAgentSource(copy),
          `${relativePath} drifted. Run bun run registry:sync-agent.`
        ).toBe(normalizeAgentSource(expected));
        expect(importSpecifiers(copy), `${relativePath} imports`).toEqual(
          importSpecifiers(expected)
        );
      })
    );
  });

  test("ships every copied file in the agent item", async () => {
    const item = getRegistryItem("agent");
    const shipped = (item?.files ?? [])
      .map((file) => file.path)
      .filter((filePath) => filePath.startsWith(`${agentRegistryDirectory}/`))
      .toSorted();
    const registryFiles = await listRegistryFiles();
    expect(shipped).toEqual(registryFiles.map(toRegistryAgentPath));
  });

  test("declares the same roles and actions as the site", () => {
    expect(registryTypes.agentRoles).toEqual(agentRoles);
    expect(registryTypes.agentActions).toEqual(agentActions);
    for (const role of agentRoles) {
      expect(registryTypes.agentSignatureActions[role]).toBe(
        agentProfiles[role].signatureActions[0]
      );
    }
  });

  test("dresses every role with a preset outfit", () => {
    expect(Object.keys(registryOutfit.rolePresets).toSorted()).toEqual(
      [...registryTypes.agentRoles].toSorted()
    );
  });
});

describe("agent docs examples", () => {
  test("show consumer code with no site-only imports", async () => {
    const exampleFiles = ["agent", "agent-stage"].flatMap(
      (name) =>
        getRegistryItem(name)?.meta.docs.examples.map(
          (example) => example.file
        ) ?? []
    );
    expect(exampleFiles.length).toBeGreaterThan(0);
    await Promise.all(
      exampleFiles.map(async (file) => {
        const displayed = toInstalledSource(await readProjectFile(file));
        expect(displayed, file).not.toContain("registry-docs");
        expect(displayed, file).not.toContain("@/registry/");
      })
    );
  });
});
