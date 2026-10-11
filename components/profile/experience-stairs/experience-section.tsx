import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";

import { stairs } from "./stairs-model";
import { StairsStage } from "./stairs-stage";

export const ExperienceSection = () => (
  <DocumentSection
    aside={<PanelCount current={stairs.length} total={stairs.length} />}
    id="experience"
    index="GH-03"
    jp="経歴"
    label="Experience"
  >
    <StairsStage stairs={stairs} />
  </DocumentSection>
);
