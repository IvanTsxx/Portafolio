import "./experience.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { DrawerPull } from "./drawer-pull";
import { ExperienceReview } from "./experience-review";
import { FileDesk } from "./file-desk";
import { FileStack } from "./file-stack";
import { FolderDrawer } from "./folder-drawer";
import { currentMonthStamp, ledgerOf } from "./ledger";
import { Talonario } from "./talonario";
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
        <ExperienceReview
          views={{
            a: <FileStack entries={entries} />,
            g: <FolderDrawer entries={entries} />,
            h: <DrawerPull entries={entries} />,
            i: <Talonario entries={entries} />,
            j: <WindowEnvelopes entries={entries} />,
          }}
        />
      </FileDesk>
    </DocumentSection>
  );
};
