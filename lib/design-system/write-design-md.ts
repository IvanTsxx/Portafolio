import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { designMarkdownPath, loadDesignMarkdown } from "./load";

const projectRoot = process.cwd();

const markdown = await loadDesignMarkdown(projectRoot);
const target = path.join(projectRoot, designMarkdownPath);

await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, markdown);

process.stdout.write(
  `Wrote ${designMarkdownPath} (${markdown.split("\n").length} lines)\n`
);
