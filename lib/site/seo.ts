import type { Metadata } from "next";

import type { Experiment } from "@/lib/lab/experiments";
import { markdownPathOf } from "@/lib/markdown/paths";
import { registryUrlTemplate } from "@/lib/registry/install";
import type { RegistryItem } from "@/lib/registry/schema";
import type { Skill } from "@/lib/skills/skills";

import { siteConfig } from "./config";

export const absoluteUrl = (pathname: string) =>
  new URL(pathname, siteConfig.url).toString();

export const siteTitle = `${siteConfig.nickname} · ${siteConfig.role}`;

export interface ArticleSeo {
  publishedTime: string;
  tags: readonly string[];
}

export interface PageSeo {
  article?: ArticleSeo;
  description: string;
  indexable?: boolean;
  keywords?: readonly string[];
  markdownPath?: `/${string}.md`;
  path: `/${string}`;
  title: string;
}

export const socialTitleOf = (page: PageSeo) =>
  page.path === "/" ? siteTitle : `${page.title} · ${siteConfig.nickname}`;

const openGraphOf = (page: PageSeo): Metadata["openGraph"] => {
  const shared = {
    description: page.description,
    locale: "en_US",
    siteName: siteConfig.nickname,
    title: socialTitleOf(page),
    url: page.path,
  };
  return page.article
    ? {
        ...shared,
        authors: [siteConfig.url],
        publishedTime: page.article.publishedTime,
        tags: [...page.article.tags],
        type: "article",
      }
    : { ...shared, type: "website" };
};

export const buildPageMetadata = (page: PageSeo): Metadata => ({
  alternates: {
    canonical: page.path,
    types: page.markdownPath
      ? { "text/markdown": page.markdownPath }
      : undefined,
  },
  description: page.description,
  keywords: page.keywords ? [...page.keywords] : undefined,
  openGraph: openGraphOf(page),
  robots: page.indexable === false ? { follow: true, index: false } : undefined,
  title: page.path === "/" ? { absolute: siteTitle } : page.title,
  twitter: {
    card: "summary_large_image",
    creator: `@${siteConfig.handle}`,
    site: `@${siteConfig.handle}`,
  },
});

export const pageSeo = {
  designSystem: {
    description:
      "Ivo's paper-and-ink design system: principles, color and type tokens, layout grid and motion rules. Copy it as a DESIGN.md for coding agents.",
    path: "/design-system",
    title: "Design system",
  },
  experiments: {
    description:
      "Interactive experiments by Ivo in shaders, dithering, motion and variable type. Each one has a live preview and implementation notes.",
    path: "/experiments",
    title: "Experiments",
  },
  home: {
    description: siteConfig.description,
    path: "/",
    title: siteTitle,
  },
  notes: {
    description:
      "Builds and thoughts by Ivo, a frontend engineer. Case studies and notes on AI agents, motion and frontend craft.",
    path: "/notes",
    title: "Notes",
  },
  registry: {
    description: `Installable shadcn components by Ivo, from text scramble to technical grids and 3D agent figures. Add any item from ${registryUrlTemplate}.`,
    path: "/registry",
    title: "Registry",
  },
  skills: {
    description: `Agent Skills by Ivo for Claude Code, Codex and other coding agents. Install any of them with npx skills add ${siteConfig.repository}.`,
    path: "/skills",
    title: "Skills",
  },
} as const satisfies Record<string, PageSeo>;

export const experimentPath = (slug: string) => `/experiments/${slug}` as const;

export const registryItemPath = (name: string) => `/registry/${name}` as const;

export const skillPath = (name: string) => `/skills/${name}` as const;

const maxDescriptionLength = 170;

const fitDescription = (description: string) => {
  if (description.length <= maxDescriptionLength) {
    return description;
  }
  const cut = description.slice(0, maxDescriptionLength - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

export const experimentSeo = (experiment: Experiment): PageSeo => ({
  description: `${experiment.summary} An interactive ${experiment.topics.join(", ")} experiment with a live preview and implementation notes.`,
  keywords: [...experiment.topics, ...experiment.technologies],
  markdownPath: markdownPathOf(experimentPath(experiment.slug)),
  path: experimentPath(experiment.slug),
  title: `${experiment.title} · Experiments`,
});

export const registryItemSeo = (item: RegistryItem): PageSeo => ({
  description: `${item.description} Install it with the shadcn CLI from Ivo's registry.`,
  keywords: ["shadcn", "React", ...item.categories],
  markdownPath: markdownPathOf(registryItemPath(item.name)),
  path: registryItemPath(item.name),
  title: `${item.title} · Registry`,
});

export const skillSeo = (skill: Skill): PageSeo => ({
  description: fitDescription(skill.description),
  keywords: ["Agent Skills", "SKILL.md", "Claude Code", skill.name],
  markdownPath: markdownPathOf(skillPath(skill.name)),
  path: skillPath(skill.name),
  title: `${skill.name} · Skills`,
});
