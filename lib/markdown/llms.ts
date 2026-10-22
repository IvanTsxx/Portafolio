import { isIndexable } from "@/lib/content/metadata";
import { notePath } from "@/lib/content/note-domain";
import type { Note } from "@/lib/content/note-domain";
import type { Experiment } from "@/lib/lab/experiments";
import type { RegistryItem } from "@/lib/registry/schema";
import { siteConfig } from "@/lib/site/config";
import {
  absoluteUrl,
  experimentPath,
  pageSeo,
  registryItemPath,
  skillPath,
} from "@/lib/site/seo";
import type { Skill } from "@/lib/skills/skills";

import { markdownPathOf } from "./paths";

export interface LlmsEntry {
  description: string;
  markdownPath: `/${string}.md`;
  title: string;
}

export interface LlmsSection {
  entries: readonly LlmsEntry[];
  title: string;
}

export interface LlmsSources {
  experiments: readonly Experiment[];
  notes: readonly Note[];
  registryItems: readonly RegistryItem[];
  skills: readonly Skill[];
}

export const llmsSections = ({
  experiments,
  notes,
  registryItems,
  skills,
}: LlmsSources): LlmsSection[] => [
  {
    entries: notes.flatMap((note) =>
      isIndexable(note)
        ? [
            {
              description: note.summary,
              markdownPath: markdownPathOf(notePath(note.slug)),
              title: note.title,
            },
          ]
        : []
    ),
    title: pageSeo.notes.title,
  },
  {
    entries: experiments.map((experiment) => ({
      description: experiment.summary,
      markdownPath: markdownPathOf(experimentPath(experiment.slug)),
      title: experiment.title,
    })),
    title: pageSeo.experiments.title,
  },
  {
    entries: registryItems.map((item) => ({
      description: item.description,
      markdownPath: markdownPathOf(registryItemPath(item.name)),
      title: item.title,
    })),
    title: pageSeo.registry.title,
  },
  {
    entries: skills.map((skill) => ({
      description: skill.description,
      markdownPath: markdownPathOf(skillPath(skill.name)),
      title: skill.name,
    })),
    title: pageSeo.skills.title,
  },
];

const entryLine = (entry: LlmsEntry) =>
  `- [${entry.title}](${absoluteUrl(entry.markdownPath)}): ${entry.description}`;

export const buildLlmsTxt = (sections: readonly LlmsSection[]) =>
  [
    `# ${siteConfig.nickname}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `Every page below is plain Markdown. Drop the .md suffix for the HTML page. All of it in one file: ${absoluteUrl("/llms-full.txt")}. The design system: ${absoluteUrl("/design-system/design.md")}.`,
    "",
    ...sections.flatMap((section) =>
      section.entries.length > 0
        ? [`## ${section.title}`, "", ...section.entries.map(entryLine), ""]
        : []
    ),
  ].join("\n");

export const buildLlmsFullTxt = (documents: readonly string[]) =>
  [
    `# ${siteConfig.nickname}`,
    "",
    `> ${siteConfig.description}`,
    "",
    ...documents.map((document) => document.trim()),
  ].join("\n\n");
