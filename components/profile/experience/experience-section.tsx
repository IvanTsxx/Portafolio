import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { currentMonthStamp, ledgerOf } from "./ledger";
import { LedgerTable } from "./ledger-table";

export const ExperienceSection = () => {
  const section = homeSectionById("experience");
  const ledger = ledgerOf(experience, currentMonthStamp(), section.index);
  const count = ledger.entries.length;

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeExperience}
    >
      <LedgerTable ledger={ledger} />
    </DocumentSection>
  );
};
