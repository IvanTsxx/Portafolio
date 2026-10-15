import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { OpenShelf } from "./open-shelf";
import { RecordCrate } from "./record-crate";
import { RepoCards } from "./repo-cards";
import { ReposReview } from "./repos-review";
import { specimensOf } from "./repositories";
import { RepositoryFiles } from "./repository-files";
import { SpineShelf } from "./spine-shelf";

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
      {count > 0 ? (
        <RepositoryFiles files={specimens.map((specimen) => specimen.file)}>
          <ReposReview
            d={<SpineShelf specimens={specimens} />}
            e={<OpenShelf specimens={specimens} />}
            f={<RecordCrate specimens={specimens} />}
            g={<RepoCards specimens={specimens} />}
          />
        </RepositoryFiles>
      ) : null}
    </DocumentSection>
  );
};
