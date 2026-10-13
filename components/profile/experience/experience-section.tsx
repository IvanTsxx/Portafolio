import "@/components/iso/iso.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { sectionScripts } from "@/lib/site/section-scripts";

import { careerOf, currentMonthStamp } from "./career";
import { gaugeParts } from "./gauge-art";
import { gaugeOf } from "./gauge-geometry";
import { GaugeLive } from "./gauge-live";

export const ExperienceSection = () => {
  const career = careerOf(experience, currentMonthStamp());
  const current = Math.max(
    0,
    career.tenures.findIndex((tenure) => tenure.isCurrent)
  );
  const { art, rig } = gaugeOf(career, current);
  const count = career.tenures.length;

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id="experience"
      index="GH-03"
      jp="経歴"
      label="Experience"
      script={sectionScripts.homeExperience}
    >
      <GaugeLive
        caption={`${count} steel gauge blocks on a granite plate, one per job since ${career.firstYear}. Each block is as long as the job ran on the month scale and one step taller than the one before. The bridge probe rides to the selected block and traces it from its first month to its last.`}
        initial={current}
        label={`Tenure gauge, ${count} jobs. Arrow keys pick a job; the probe traces how long it ran.`}
        parts={gaugeParts(art)}
        rig={rig}
        tenures={career.tenures}
      />
    </DocumentSection>
  );
};
