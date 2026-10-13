import "@/components/iso/iso.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { sectionScripts } from "@/lib/site/section-scripts";

import { catalogOf, languageText, starsText } from "./catalog";
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
  const templates = catalog.cards.filter((card) => card.isTemplate).length;

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
        caption={`${count} edge-notched index cards in a catalog drawer, one per pinned repository. Each tab stands in its language's column (${languageText(catalog)}), each card's edge is notched once per star (${starsText(catalog.stars)} in all), and its typed lines run as long as the name and description.${templates ? " A clip marks the template." : ""} The reader feeds a card in and opens its repository on GitHub.`}
        catalog={catalog}
        counter={art.reader.counter}
        label={`Card catalog of ${count} pinned repositories. Tab to a card to lift it; Enter feeds it to the reader and opens the repository on GitHub.`}
        parts={catalogParts(art)}
        rig={rig}
      />
    </DocumentSection>
  );
};
