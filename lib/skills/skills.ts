import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { slugPattern } from "@/lib/content/schema";

const skillFrontmatterSchema = z.object({
  description: z.string().min(1),
  license: z.string().min(1).optional(),
  metadata: z
    .object({
      author: z.string().min(1).optional(),
      version: z.string().min(1).optional(),
    })
    .optional(),
  name: z
    .string()
    .regex(slugPattern, "Use lowercase letters, digits and single hyphens"),
});

type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>;

export interface Skill extends SkillFrontmatter {
  body: string;
  files: readonly string[];
}

export class SkillError extends Error {
  override name = "SkillError";
}

const skillFileName = "SKILL.md";

const frontmatterFence = "---";

const splitFrontmatter = (source: string) => {
  const lines = source.split(/\r?\n/u);
  const end = lines.indexOf(frontmatterFence, 1);
  if (lines[0] !== frontmatterFence || end === -1) {
    return;
  }
  return {
    body: lines.slice(end + 1).join("\n"),
    yaml: lines.slice(1, end).join("\n"),
  };
};

const privateFilePattern = /\.local\.md$/u;

const isPublicSkillFile = (relativePath: string) =>
  !privateFilePattern.test(relativePath) &&
  relativePath.split("/").every((segment) => !segment.startsWith("."));

export const parseSkill = (
  folder: string,
  source: string,
  files: readonly string[]
): Skill => {
  const label = `skills/${folder}/${skillFileName}`;
  const sections = splitFrontmatter(source);
  if (!sections) {
    throw new SkillError(
      `${label}: start the file with a --- frontmatter block`
    );
  }
  const parsed = skillFrontmatterSchema.safeParse(parseYaml(sections.yaml));
  if (!parsed.success) {
    throw new SkillError(
      `${label}: invalid frontmatter\n${z.prettifyError(parsed.error)}`
    );
  }
  if (parsed.data.name !== folder) {
    throw new SkillError(
      `${label}: name "${parsed.data.name}" must match the folder name "${folder}"`
    );
  }
  return {
    ...parsed.data,
    body: sections.body.trim(),
    files: files.filter(isPublicSkillFile).toSorted(),
  };
};

const listSkillFiles = (skillDirectory: string) =>
  readdirSync(skillDirectory, { recursive: true, withFileTypes: true }).flatMap(
    (entry) =>
      entry.isFile()
        ? [
            path
              .relative(skillDirectory, path.join(entry.parentPath, entry.name))
              .split(path.sep)
              .join("/"),
          ]
        : []
  );

const readSkillFolder = (skillsDirectory: string, folder: string) => {
  const skillDirectory = path.join(skillsDirectory, folder);
  const files = listSkillFiles(skillDirectory);
  if (!files.includes(skillFileName)) {
    throw new SkillError(`skills/${folder}: missing ${skillFileName}`);
  }
  return parseSkill(
    folder,
    readFileSync(path.join(skillDirectory, skillFileName), "utf-8"),
    files
  );
};

export const loadSkills = (skillsDirectory: string): Skill[] =>
  readdirSync(skillsDirectory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() && !entry.name.startsWith(".")
        ? [readSkillFolder(skillsDirectory, entry.name)]
        : []
    )
    .toSorted((first, second) => first.name.localeCompare(second.name));

const skillsDirectory = path.join(process.cwd(), "skills");

export const skills = loadSkills(skillsDirectory);

export const getSkill = (name: string): Skill | undefined =>
  skills.find((skill) => skill.name === name);

export const getSkillIndex = (name: string) =>
  skills.findIndex((skill) => skill.name === name);

export const formatSkillIndex = (position: number) =>
  `S-${String(position + 1).padStart(2, "0")}`;

export const readSkillSource = (skill: Skill) =>
  readFileSync(path.join(skillsDirectory, skill.name, skillFileName), "utf-8");
