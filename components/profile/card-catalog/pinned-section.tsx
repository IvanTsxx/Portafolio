import "@/components/iso/iso.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { sectionScripts } from "@/lib/site/section-scripts";

import { catalogOf, starsText } from "./catalog";
import { catalogParts } from "./catalog-art";
import { catalogFigureOf } from "./catalog-geometry";
import { CatalogLive } from "./catalog-live";

export const PinnedSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const catalog = catalogOf(repositories);
  const { art, rig } = catalogFigureOf(catalog);
  const count = catalog.cards.length;

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id="pinned"
      index="GH-04"
      jp="固定標本"
      label="Pinned"
      script={sectionScripts.homePinned}
    >
      <CatalogLive
        caption={`A catalog drawer of ${count} index cards, one per pinned repository, notched once per star (${starsText(catalog.stars)}).`}
        catalog={catalog}
        counter={art.reader.counter}
        label={`Card catalog of ${count} pinned repositories. Enter opens a repository on GitHub.`}
        parts={catalogParts(art)}
        rig={rig}
      />
    </DocumentSection>
  );
};
