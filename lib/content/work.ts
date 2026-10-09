import path from "node:path";

import { createCollection } from "./collection";
import type { ContentEntry, MdxModule } from "./collection";
import { countFacets } from "./facets";
import { workMetaSchema } from "./schema";
import type { WorkMeta } from "./schema";

export type WorkProject = ContentEntry<WorkMeta>;

export type WorkIndexItem = Pick<
  WorkProject,
  | "context"
  | "role"
  | "sample"
  | "slug"
  | "summary"
  | "technologies"
  | "title"
  | "year"
>;

export const toWorkIndexItem = ({
  context,
  role,
  sample,
  slug,
  summary,
  technologies,
  title,
  year,
}: WorkProject): WorkIndexItem => ({
  context,
  role,
  sample,
  slug,
  summary,
  technologies,
  title,
  year,
});

export interface WorkFilter {
  featured?: boolean;
  technology?: string;
}

export const compareProjects = (a: WorkProject, b: WorkProject) =>
  b.year - a.year || a.title.localeCompare(b.title);

export const findRelationIssues = (projects: readonly WorkProject[]) => {
  const slugs = new Set(projects.map((project) => project.slug));
  return projects.flatMap((project) =>
    project.related.flatMap((related) => {
      if (related === project.slug) {
        return [`${project.slug} lists itself as related`];
      }
      return slugs.has(related)
        ? []
        : [`${project.slug} relates to unknown project "${related}"`];
    })
  );
};

export const filterProjects = (
  projects: readonly WorkProject[],
  filter: WorkFilter = {}
) =>
  projects.filter(
    (project) =>
      (filter.featured === undefined || project.featured === filter.featured) &&
      (filter.technology === undefined ||
        project.technologies.includes(filter.technology))
  );

export const pickRelatedProjects = (
  projects: readonly WorkProject[],
  project: WorkProject
) =>
  project.related.flatMap((slug) => {
    const related = projects.find((candidate) => candidate.slug === slug);
    return related ? [related] : [];
  });

const collection = createCollection<WorkMeta>({
  compare: compareProjects,
  directoryPath: path.join(process.cwd(), "content", "work"),
  findIssues: findRelationIssues,
  importModule: (slug): Promise<MdxModule> =>
    import(`@/content/work/${slug}.mdx`),
  label: "content/work",
  metaSchema: workMetaSchema,
});

export const getProjectSlugs = collection.slugs;

export const getProject = collection.getBySlug;

export const getProjects = async (filter: WorkFilter = {}) =>
  filterProjects(await collection.list(), filter);

export const getRelatedProjects = async (project: WorkProject) =>
  pickRelatedProjects(await collection.list(), project);

export const getProjectTechnologies = async () => {
  const projects = await collection.list();
  return countFacets(projects.map((project) => project.technologies));
};
