import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";

import { buildShelf } from "./shelf-model";
import { ShelfStage } from "./shelf-stage";

export const PinnedSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const books = buildShelf(repositories);

  return (
    <DocumentSection
      aside={<PanelCount current={books.length} total={books.length} />}
      id="pinned"
      index="GH-04"
      jp="固定標本"
      label="Pinned"
    >
      <ShelfStage books={books} />
    </DocumentSection>
  );
};
