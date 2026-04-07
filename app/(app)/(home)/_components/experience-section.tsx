import { LoadMoreItemsWrapper } from "@/shared/components/load-more-items-wrapper";
import { EXPERIENCES } from "@/shared/config/experiences";

import { ExperienceItem } from "./experience-item";
import { SectionHeader } from "./section-header";

export function ExperienceSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader label="Experience" />
      <LoadMoreItemsWrapper max={3}>
        {EXPERIENCES.map((exp) => (
          <ExperienceItem key={exp.id} experience={exp} />
        ))}
      </LoadMoreItemsWrapper>
    </section>
  );
}
