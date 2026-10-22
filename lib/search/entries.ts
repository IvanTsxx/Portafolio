import {
  formatNoteCode,
  noteKinds,
  stackOf,
  tagsOf,
} from "@/lib/content/note-domain";
import type { Note } from "@/lib/content/note-domain";
import { formatRegistryIndex } from "@/lib/registry/registry";
import type { RegistryItem } from "@/lib/registry/schema";
import { homeSections, primaryRoutes, siteConfig } from "@/lib/site/config";
import type { Social, SocialId } from "@/lib/site/config";
import { formatSkillIndex } from "@/lib/skills/skills";
import type { Skill } from "@/lib/skills/skills";

import type { SearchEntry } from "./types";

interface SectionSource {
  id: string;
  index: string;
  label: string;
}

interface ExperimentSource {
  index: string;
  slug: string;
  summary: string;
  technologies: readonly string[];
  title: string;
  topics: readonly string[];
  year: number;
}

const DETAIL_SEPARATOR = " · ";

const socialCodes = {
  email: "MAIL",
  github: "GH",
  x: "X",
} as const satisfies Record<SocialId, string>;

const joinDetail = (...parts: readonly (string | undefined)[]) =>
  parts
    .filter((part) => part !== undefined && part !== "")
    .join(DETAIL_SEPARATOR);

export const pageEntries = (): SearchEntry[] =>
  primaryRoutes.map((route) => ({
    action: { href: route.href, type: "route" },
    code: route.index,
    detail: route.href,
    group: "pages",
    id: `page:${route.href}`,
    keywords: [route.jp],
    title: route.label,
  }));

export const sectionEntries = (
  pageLabel: string,
  pageHref: string,
  sections: readonly SectionSource[]
): SearchEntry[] =>
  sections.map((section) => ({
    action: { href: `${pageHref}#${section.id}`, type: "route" },
    code: section.index,
    detail: pageLabel,
    group: "sections",
    id: `section:${pageHref}#${section.id}`,
    keywords: [],
    title: section.label,
  }));

export const homeSectionEntries = () =>
  sectionEntries("Home", "/", homeSections);

export const noteEntry = (note: Note, position: number): SearchEntry => ({
  action: { href: `/notes/${note.slug}`, type: "route" },
  code: formatNoteCode(position),
  detail: joinDetail(
    noteKinds[note.kind].label,
    [...tagsOf(note), ...stackOf(note)].join(", ")
  ),
  group: "notes",
  id: `note:${note.slug}`,
  keywords: [note.summary],
  title: note.title,
});

export const experimentEntry = (experiment: ExperimentSource): SearchEntry => ({
  action: { href: `/experiments/${experiment.slug}`, type: "route" },
  code: experiment.index,
  detail: experiment.topics.join(", "),
  group: "experiments",
  id: `experiment:${experiment.slug}`,
  keywords: [
    experiment.summary,
    ...experiment.technologies,
    String(experiment.year),
  ],
  title: experiment.title,
});

export const registryEntry = (
  item: RegistryItem,
  position: number
): SearchEntry => ({
  action: { href: `/registry/${item.name}`, type: "route" },
  code: formatRegistryIndex(position),
  detail: item.categories.join(", "),
  group: "registry",
  id: `registry:${item.name}`,
  keywords: [item.description, item.name],
  title: item.title,
});

export const skillEntry = (skill: Skill, position: number): SearchEntry => ({
  action: { href: `/skills/${skill.name}`, type: "route" },
  code: formatSkillIndex(position),
  detail: "Agent skill",
  group: "skills",
  id: `skill:${skill.name}`,
  keywords: [skill.description],
  title: skill.name,
});

const socialEntry = (social: Social): SearchEntry => ({
  action:
    social.id === "email"
      ? { type: "copy", value: siteConfig.email }
      : { href: social.href, type: "external" },
  code: socialCodes[social.id],
  detail: social.id === "email" ? siteConfig.email : social.handle,
  group: "channels",
  id: `channel:${social.id}`,
  keywords: [],
  title: social.id === "email" ? "Copy email" : social.label,
});

export const channelEntries = (): SearchEntry[] =>
  siteConfig.socials.map(socialEntry);
