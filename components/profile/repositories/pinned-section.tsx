import "@/components/iso/iso.css";
import { ConceptReview } from "@/components/iso/concept-review";
import { IsoPicker } from "@/components/iso/iso-picker";
import type { PickerEntry } from "@/components/iso/iso-picker";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { CityFigure } from "./city-figure";
import { cityFrames, citySceneOf } from "./city-geometry";
import { specimensOf } from "./repositories";
import type { RepositorySpecimen } from "./repositories";
import { ShelfFigure } from "./shelf-figure";
import { shelfFrames, shelfSceneOf } from "./shelf-geometry";

const pickerEntriesOf = (
  specimens: readonly RepositorySpecimen[]
): PickerEntry[] =>
  specimens.map((specimen) => ({
    file: specimen.file,
    lead: `${specimen.owner}/${specimen.name}`,
    trail: `${specimen.language} · ★ ${specimen.stars} · pushed ${specimen.pushed}`,
  }));

export const PinnedSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const section = homeSectionById("pinned");
  const specimens = specimensOf(repositories, section.index);
  const count = specimens.length;
  const entries = pickerEntriesOf(specimens);
  const links = specimens.map((specimen) => ({
    href: specimen.url,
    label: `${specimen.spoken}. Open file.`,
  }));
  const rest = {
    lead: `${String(count).padStart(2, "0")} pinned`,
    trail: "Select one to open its file",
  };

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homePinned}
    >
      {count > 0 ? (
        <ConceptReview
          a={
            <IsoPicker
              entries={entries}
              label={`Repository shelf: ${count} pinned repositories as boxes, each as tall as its stars.`}
              rest={rest}
              tall={
                <ShelfFigure
                  idPrefix="shelf-tall"
                  links={links}
                  scene={shelfSceneOf(specimens, shelfFrames.tall)}
                />
              }
              wide={
                <ShelfFigure
                  idPrefix="shelf-wide"
                  links={links}
                  scene={shelfSceneOf(specimens, shelfFrames.wide)}
                />
              }
            />
          }
          b={
            <IsoPicker
              entries={entries}
              label={`Repository city: ${count} pinned repositories as towers, one floor per star.`}
              rest={rest}
              tall={
                <CityFigure
                  links={links}
                  scene={citySceneOf(specimens, cityFrames.tall)}
                />
              }
              wide={
                <CityFigure
                  links={links}
                  scene={citySceneOf(specimens, cityFrames.wide)}
                />
              }
            />
          }
        />
      ) : null}
    </DocumentSection>
  );
};
