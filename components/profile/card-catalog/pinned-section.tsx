import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { specimensOf } from "./repositories";
import { RepositoryGrid } from "./repository-grid";

export const PinnedSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const section = homeSectionById("pinned");
  const specimens = specimensOf(repositories, section.index);
  const count = specimens.length;

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homePinned}
    >
      <RepositoryGrid specimens={specimens} />
    </DocumentSection>
  );
};
