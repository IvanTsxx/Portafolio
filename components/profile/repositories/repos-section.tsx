import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { CassetteTower } from "./cassette-tower";
import { specimensOf } from "./repositories";
import { RepositoryFiles } from "./repository-files";

export const ReposSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const section = homeSectionById("repos");
  const specimens = specimensOf(repositories, section.index);
  const count = specimens.length;

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeRepos}
    >
      {count > 0 ? (
        <RepositoryFiles files={specimens.map((specimen) => specimen.file)}>
          <CassetteTower specimens={specimens} />
        </RepositoryFiles>
      ) : null}
    </DocumentSection>
  );
};
