import { LoadMoreItemsWrapper } from "@/shared/components/load-more-items-wrapper";
import { PROJECTS } from "@/shared/config/projects";

import { ProjectItem } from "./project-item";
import { SectionHeader } from "./section-header";

export function ProjectsSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader label="Projects" />
      <LoadMoreItemsWrapper max={3}>
        {PROJECTS.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </LoadMoreItemsWrapper>
    </section>
  );
}
