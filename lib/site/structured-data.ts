import { isIndexable } from "@/lib/content/metadata";
import { notePath } from "@/lib/content/note-domain";
import type { Note } from "@/lib/content/note-domain";
import type { Experiment } from "@/lib/lab/experiments";
import { markdownPathOf } from "@/lib/markdown/paths";
import type { RegistryItem } from "@/lib/registry/schema";
import type { Skill } from "@/lib/skills/skills";

import { siteConfig } from "./config";
import { experience } from "./experience";
import {
  absoluteUrl,
  experimentPath,
  pageSeo,
  registryItemPath,
  siteTitle,
  skillPath,
} from "./seo";
import type { PageSeo } from "./seo";

export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": readonly object[];
}

export interface Crumb {
  name: string;
  path: `/${string}`;
}

const personId = `${siteConfig.url}/#person`;
const websiteId = `${siteConfig.url}/#website`;

const personRef = { "@id": personId };

const toGraph = <Nodes extends readonly object[]>(...nodes: Nodes) =>
  ({
    "@context": "https://schema.org",
    "@graph": nodes,
  }) as const satisfies JsonLdGraph;

const currentEmployer = experience.find((role) => role.end === null);

const personNode = () => ({
  "@id": personId,
  "@type": "Person",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AR",
    addressLocality: "Tucumán",
  },
  alternateName: siteConfig.handle,
  email: `mailto:${siteConfig.email}`,
  image: absoluteUrl("/avatar"),
  jobTitle: siteConfig.role,
  name: siteConfig.nickname,
  sameAs: siteConfig.socials.flatMap((social) =>
    social.id === "email" ? [] : [social.href]
  ),
  url: siteConfig.url,
  worksFor: currentEmployer && {
    "@type": "Organization",
    name: currentEmployer.company,
    url: currentEmployer.website ?? undefined,
  },
});

const websiteNode = () => ({
  "@id": websiteId,
  "@type": "WebSite",
  alternateName: siteTitle,
  author: personRef,
  description: siteConfig.description,
  inLanguage: "en",
  name: siteConfig.nickname,
  publisher: personRef,
  url: siteConfig.url,
});

const webPageFields = (page: PageSeo) => ({
  "@id": `${absoluteUrl(page.path)}#webpage`,
  description: page.description,
  inLanguage: "en",
  isPartOf: { "@id": websiteId },
  name: page.title,
  url: absoluteUrl(page.path),
});

export const breadcrumbNode = (trail: readonly Crumb[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...trail].map(
    (crumb, position) => ({
      "@type": "ListItem",
      item: absoluteUrl(crumb.path),
      name: crumb.name,
      position: position + 1,
    })
  ),
});

const collectionPage = (
  page: PageSeo,
  items: readonly { name: string; path: string }[]
) => ({
  ...webPageFields(page),
  "@type": "CollectionPage",
  breadcrumb: breadcrumbNode([{ name: page.title, path: page.path }]),
  mainEntity:
    items.length > 0
      ? {
          "@type": "ItemList",
          itemListElement: items.map((item, position) => ({
            "@type": "ListItem",
            name: item.name,
            position: position + 1,
            url: absoluteUrl(item.path),
          })),
        }
      : undefined,
});

export const homeJsonLd = () =>
  toGraph(personNode(), websiteNode(), {
    ...webPageFields(pageSeo.home),
    "@type": "ProfilePage",
    mainEntity: personRef,
  });

export const notesIndexJsonLd = (notes: readonly Note[]) =>
  toGraph(
    collectionPage(
      pageSeo.notes,
      notes.flatMap((note) =>
        isIndexable(note)
          ? [{ name: note.title, path: notePath(note.slug) }]
          : []
      )
    )
  );

export const experimentsIndexJsonLd = (experiments: readonly Experiment[]) =>
  toGraph(
    collectionPage(
      pageSeo.experiments,
      experiments.map((experiment) => ({
        name: experiment.title,
        path: experimentPath(experiment.slug),
      }))
    )
  );

export const registryIndexJsonLd = (items: readonly RegistryItem[]) =>
  toGraph(
    collectionPage(
      pageSeo.registry,
      items.map((item) => ({
        name: item.title,
        path: registryItemPath(item.name),
      }))
    )
  );

export const skillsIndexJsonLd = (skills: readonly Skill[]) =>
  toGraph(
    collectionPage(
      pageSeo.skills,
      skills.map((skill) => ({ name: skill.name, path: skillPath(skill.name) }))
    )
  );

export const designSystemJsonLd = () =>
  toGraph(
    {
      "@type": "TechArticle",
      author: personRef,
      description: pageSeo.designSystem.description,
      headline: pageSeo.designSystem.title,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      url: absoluteUrl(pageSeo.designSystem.path),
    },
    breadcrumbNode([
      { name: pageSeo.designSystem.title, path: pageSeo.designSystem.path },
    ])
  );

const markdownEncoding = (path: `/${string}`) => ({
  "@type": "MediaObject",
  contentUrl: absoluteUrl(markdownPathOf(path)),
  encodingFormat: "text/markdown",
});

const notesCrumb: Crumb = {
  name: pageSeo.notes.title,
  path: pageSeo.notes.path,
};

export const noteJsonLd = (note: Note) => {
  const path = notePath(note.slug);
  const shared = {
    author: personRef,
    description: note.summary,
    encoding: markdownEncoding(path),
    headline: note.title,
    inLanguage: "en",
    mainEntityOfPage: absoluteUrl(path),
    url: absoluteUrl(path),
  };
  const entity =
    note.kind === "note"
      ? {
          ...shared,
          "@type": "BlogPosting",
          datePublished: note.date,
          keywords: note.tags.join(", "),
        }
      : {
          ...shared,
          "@type": "Article",
          datePublished: note.date,
          keywords: note.stack.join(", "),
        };
  return toGraph(
    entity,
    breadcrumbNode([notesCrumb, { name: note.title, path }])
  );
};

export const experimentJsonLd = (experiment: Experiment) => {
  const path = experimentPath(experiment.slug);
  return toGraph(
    {
      "@type": "CreativeWork",
      author: personRef,
      dateCreated: String(experiment.year),
      description: experiment.summary,
      encoding: markdownEncoding(path),
      genre: experiment.topics.join(", "),
      inLanguage: "en",
      isBasedOn: experiment.sourceUrl,
      keywords: experiment.technologies.join(", "),
      name: experiment.title,
      url: absoluteUrl(path),
    },
    breadcrumbNode([
      { name: pageSeo.experiments.title, path: pageSeo.experiments.path },
      { name: experiment.title, path },
    ])
  );
};

const languageOf = (item: RegistryItem) =>
  item.files.some((file) => /\.tsx?$/u.test(file.path))
    ? "TypeScript"
    : "JavaScript";

export const registryItemJsonLd = (item: RegistryItem) => {
  const path = registryItemPath(item.name);
  return toGraph(
    {
      "@type": "SoftwareSourceCode",
      author: personRef,
      codeRepository: `https://github.com/${siteConfig.repository}`,
      description: item.description,
      encoding: markdownEncoding(path),
      name: item.title,
      programmingLanguage: languageOf(item),
      runtimePlatform: "React",
      url: absoluteUrl(path),
    },
    breadcrumbNode([
      { name: pageSeo.registry.title, path: pageSeo.registry.path },
      { name: item.title, path },
    ])
  );
};

export const skillJsonLd = (skill: Skill) => {
  const path = skillPath(skill.name);
  return toGraph(
    {
      "@type": "SoftwareSourceCode",
      author: personRef,
      codeRepository: `https://github.com/${siteConfig.repository}`,
      description: skill.description,
      encoding: markdownEncoding(path),
      license: skill.license,
      name: skill.name,
      programmingLanguage: "Markdown",
      softwareVersion: skill.metadata?.version,
      url: absoluteUrl(path),
    },
    breadcrumbNode([
      { name: pageSeo.skills.title, path: pageSeo.skills.path },
      { name: skill.name, path },
    ])
  );
};
