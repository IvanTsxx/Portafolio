import "./experience.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { ExperienceReview } from "./experience-review";
import { FannedCards } from "./fanned-cards";
import { FileDesk } from "./file-desk";
import { FileStack } from "./file-stack";
import { FolderDrawer } from "./folder-drawer";
import { currentMonthStamp, ledgerOf } from "./ledger";
import { RingBinder } from "./ring-binder";

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
        <ExperienceReview
          views={{
            a: <FileStack entries={entries} />,
            e: <RingBinder entries={entries} />,
            f: <FannedCards entries={entries} />,
            g: <FolderDrawer entries={entries} />,
          }}
        />
      </FileDesk>
    </DocumentSection>
  );
};
