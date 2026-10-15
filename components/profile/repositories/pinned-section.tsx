import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { CatalogCards } from "./catalog-cards";
import { PrintProofs } from "./print-proofs";
import { ReposReview } from "./repos-review";
import { specimensOf } from "./repositories";
import { RepositoryFiles } from "./repository-files";
import { SpineShelf } from "./spine-shelf";
import { TerminalPrintout } from "./terminal-printout";

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
            a={<CatalogCards specimens={specimens} />}
            b={<PrintProofs specimens={specimens} />}
            c={<TerminalPrintout specimens={specimens} />}
            d={<SpineShelf specimens={specimens} />}
          />
        </RepositoryFiles>
      ) : null}
    </DocumentSection>
  );
};
