"use client";

import { FilterBar } from "@/components/content/filter-bar";
import { useUrlFilter } from "@/components/content/use-url-filter";
import { WorkRow } from "@/components/content/work-row";
import { PanelHeading } from "@/components/site/panel-heading";
import type { FacetCount } from "@/lib/content/facets";
import type { WorkIndexItem } from "@/lib/content/work";

const pad = (value: number) => String(value).padStart(2, "0");

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
    <section
      aria-label="Work archive"
      className="mx-auto w-full max-w-screen-2xl px-4 pb-8 md:px-8"
    >
      <PanelHeading
        aside={`${pad(visibleProjects.length)} / ${pad(projects.length)}`}
        as="h2"
        index="WK-01"
        jp="記録"
        label="Archive"
      />
      <div className="py-6">
        <FilterBar
          active={technology}
          facets={technologies}
          label="Stack"
          onChange={setTechnology}
          shown={visibleProjects.length}
          total={projects.length}
        />
      </div>
      <div
        aria-hidden
        className="label text-mist border-rule-strong hidden grid-cols-12 gap-x-4 border-y px-5 py-3 lg:grid"
      >
        <span className="col-span-1">No.</span>
        <span className="col-span-1">Year</span>
        <span className="col-span-4">Project</span>
        <span className="col-span-2">Context</span>
        <span className="col-span-2">Role</span>
        <span className="col-span-2">Stack</span>
      </div>
      <ul className="border-rule border-t lg:border-t-0">
        {visibleProjects.map((project) => {
          const position = projects.indexOf(project);
          return (
            <WorkRow
              index={pad(position + 1)}
              key={project.slug}
              project={project}
            />
          );
        })}
      </ul>
    </section>
  );
};
