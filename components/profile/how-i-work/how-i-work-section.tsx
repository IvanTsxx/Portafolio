import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { workSteps } from "@/lib/site/practice";
import { sectionScripts } from "@/lib/site/section-scripts";

import { WorkStages } from "./work-stages";

export const HowIWork = () => (
  <DocumentSection
    aside={<PanelCount current={workSteps.length} total={workSteps.length} />}
    id="how-i-work"
    index="GH-06"
    label="How I work"
    script={sectionScripts.homeHowIWork}
  >
    <WorkStages />
  </DocumentSection>
);
