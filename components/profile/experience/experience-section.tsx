import "@/components/iso/iso.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { sectionScripts } from "@/lib/site/section-scripts";

import { careerOf, currentMonthStamp } from "./career";
import { clockParts } from "./clock-art";
import { clockOf } from "./clock-geometry";
import { ClockLive } from "./clock-live";

export const ExperienceSection = () => {
  const career = careerOf(experience, currentMonthStamp());
  const { art, mask, pockets, projection } = clockOf(career);
  const count = career.tenures.length;
  const ended = career.tenures.filter((tenure) => !tenure.isCurrent).length;

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id="experience"
      index="GH-03"
      label="Experience"
      script={sectionScripts.homeExperience}
    >
      <ClockLive
        caption={`A punch clock with one time card per job since ${career.firstYear}. ${ended} cards are punched out; the current one is punched in.`}
        mask={mask}
        parts={clockParts(art)}
        pockets={pockets}
        projection={projection}
        tenures={career.tenures}
      />
    </DocumentSection>
  );
};
