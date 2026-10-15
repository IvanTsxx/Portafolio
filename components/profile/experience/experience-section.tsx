import "./experience.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { DictionaryIndex } from "./dictionary-index";
import { ExperienceReview } from "./experience-review";
import { FileDesk } from "./file-desk";
import { FileStack } from "./file-stack";
import { currentMonthStamp, ledgerOf } from "./ledger";
import { PunchedTape } from "./punched-tape";
import { TypedResume } from "./typed-resume";

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
      <FileDesk>
        <ExperienceReview
          views={{
            a: <FileStack entries={ledger.entries} />,
            b: <TypedResume entries={ledger.entries} />,
            c: <PunchedTape ledger={ledger} />,
            d: <DictionaryIndex entries={ledger.entries} />,
          }}
        />
      </FileDesk>
    </DocumentSection>
  );
};
