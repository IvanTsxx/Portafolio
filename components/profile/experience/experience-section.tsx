import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { sectionScripts } from "@/lib/site/section-scripts";

import { stairs } from "./stairs-model";
import { StairsStage } from "./stairs-stage";

export const ExperienceSection = () => (
  <DocumentSection
    aside={<PanelCount current={stairs.length} total={stairs.length} />}
    id="experience"
    index="GH-03"
    jp="経歴"
    label="Experience"
    script={sectionScripts.homeExperience}
  >
    <StairsStage stairs={stairs} />
  </DocumentSection>
);
