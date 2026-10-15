import "./experience.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { FileDesk } from "./file-desk";
import { currentMonthStamp, ledgerOf } from "./ledger";
import { WindowEnvelopes } from "./window-envelopes";

export const ExperienceSection = () => {
  const section = homeSectionById("experience");
  const { entries } = ledgerOf(experience, currentMonthStamp(), section.index);

  return (
    <DocumentSection
      aside={<PanelCount current={entries.length} total={entries.length} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeExperience}
    >
      <FileDesk>
        <WindowEnvelopes entries={entries} />
      </FileDesk>
    </DocumentSection>
  );
};
