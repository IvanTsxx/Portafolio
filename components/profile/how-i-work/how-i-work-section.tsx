import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { homeSectionById } from "@/lib/site/page-sections";
import { workSteps } from "@/lib/site/practice";
import { sectionScripts } from "@/lib/site/section-scripts";

import { WorkStages } from "./work-stages";

export const HowIWork = () => {
  const section = homeSectionById("how-i-work");
  return (
    <DocumentSection
      aside={<PanelCount current={workSteps.length} total={workSteps.length} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeHowIWork}
    >
      <WorkStages />
    </DocumentSection>
  );
};
