import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  agentSourceDirectory,
  listAgentSourceFiles,
  toRegistryAgentPath,
  toRegistryAgentSource,
} from "./agent-source";

const projectRoot = process.cwd();

const relativePaths = await listAgentSourceFiles(projectRoot);

await Promise.all(
  relativePaths.map(async (relativePath) => {
    const source = await readFile(
      path.join(projectRoot, agentSourceDirectory, relativePath),
      "utf-8"
    );
    const target = path.join(projectRoot, toRegistryAgentPath(relativePath));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, toRegistryAgentSource(source, relativePath));
  })
);

process.stdout.write(
  `Synced ${relativePaths.length} files into registry/ivan/components/agent\n`
);
