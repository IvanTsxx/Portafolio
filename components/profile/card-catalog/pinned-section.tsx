import "@/components/iso/iso.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { sectionScripts } from "@/lib/site/section-scripts";

import { catalogOf, repositoryFile, starsText } from "./catalog";
import { catalogParts } from "./catalog-art";
import { catalogFigureOf } from "./catalog-geometry";
import { CatalogLive } from "./catalog-live";

const SECTION_INDEX = "GH-04";

export const PinnedSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const catalog = catalogOf(repositories);
  const { art, rig } = catalogFigureOf(catalog);
  const count = catalog.cards.length;
  const files = catalog.cards.map((card, slot) =>
    repositoryFile(card, slot, count, SECTION_INDEX)
  );

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id="pinned"
      index={SECTION_INDEX}
      label="Pinned"
      script={sectionScripts.homePinned}
    >
      <CatalogLive
        caption={`A catalog drawer of ${count} index cards, one per pinned repository, notched once per star (${starsText(catalog.stars)}).`}
        catalog={catalog}
        counter={art.reader.counter}
        files={files}
        label={`Card catalog of ${count} pinned repositories. Enter opens its file.`}
        parts={catalogParts(art)}
        rig={rig}
      />
    </DocumentSection>
  );
};
