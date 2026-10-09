"use client";

import { FilterBar } from "@/components/content/filter-bar";
import { useUrlFilter } from "@/components/content/use-url-filter";
import { WorkRow } from "@/components/content/work-row";
import type { FacetCount } from "@/lib/content/facets";
import type { WorkIndexItem } from "@/lib/content/work";

export const WorkArchive = ({
  projects,
  technologies,
}: {
  projects: readonly WorkIndexItem[];
  technologies: readonly FacetCount[];
}) => {
  const [requestedTechnology, setTechnology] = useUrlFilter("stack");
  const technology = technologies.some(
    (facet) => facet.name === requestedTechnology
  )
    ? requestedTechnology
    : "";
  const visibleProjects = technology
    ? projects.filter((project) => project.technologies.includes(technology))
    : projects;

  return (
    <>
      <div className="px-4 pb-8 md:px-6">
        <FilterBar
          active={technology}
          facets={technologies}
          label="Filter by stack"
          onChange={setTechnology}
          shown={visibleProjects.length}
          total={projects.length}
        />
      </div>
      <div
        aria-hidden
        className="label text-faint border-rule hidden grid-cols-12 gap-x-4 border-t px-6 py-3 lg:grid"
      >
        <span className="col-span-1">No.</span>
        <span className="col-span-1">Year</span>
        <span className="col-span-4">Project</span>
        <span className="col-span-2">Context</span>
        <span className="col-span-2">Role</span>
        <span className="col-span-2">Stack</span>
      </div>
      <ul className="border-rule border-t lg:border-t-0">
        {visibleProjects.map((project) => (
          <WorkRow
            index={String(projects.indexOf(project) + 1).padStart(2, "0")}
            key={project.slug}
            project={project}
          />
        ))}
      </ul>
    </>
  );
};
