import "@/components/iso/iso.css";
import { ConceptReview } from "@/components/iso/concept-review";
import { IsoPicker } from "@/components/iso/iso-picker";
import type { PickerEntry } from "@/components/iso/iso-picker";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { currentMonthStamp, ledgerOf } from "./ledger";
import type { Ledger } from "./ledger";
import { TimelineFigure } from "./timeline-figure";
import { timelineFrames, timelineSceneOf } from "./timeline-geometry";
import { TowerFigure } from "./tower-figure";
import { towerFrames, towerSceneOf } from "./tower-geometry";

const pickerEntriesOf = (ledger: Ledger): PickerEntry[] =>
  ledger.entries.toReversed().map((entry) => ({
    file: entry.file,
    href: entry.file.links[0]?.href ?? null,
    lead: `${entry.ordinal} · ${entry.company}`,
    trail: `${entry.role} · ${entry.dates} · ${entry.length}`,
  }));

const labelsOf = (ledger: Ledger) =>
  ledger.entries.toReversed().map((entry) => `${entry.spoken}. Open file.`);

export const ExperienceSection = () => {
  const section = homeSectionById("experience");
  const ledger = ledgerOf(experience, currentMonthStamp(), section.index);
  const count = ledger.entries.length;
  const entries = pickerEntriesOf(ledger);
  const labels = labelsOf(ledger);
  const rest = {
    lead: `${String(count).padStart(2, "0")} roles`,
    trail: `${ledger.firstYear} → now · select one to open its file`,
  };

  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeExperience}
    >
      <ConceptReview
        a={
          <IsoPicker
            entries={entries}
            label={`Tenure timeline: ${count} roles on a plate ruled in years, each block as long as the role lasted.`}
            rest={rest}
            tall={
              <TimelineFigure
                labels={labels}
                scene={timelineSceneOf(ledger, timelineFrames.tall)}
              />
            }
            wide={
              <TimelineFigure
                labels={labels}
                scene={timelineSceneOf(ledger, timelineFrames.wide)}
              />
            }
          />
        }
        b={
          <IsoPicker
            entries={entries}
            label="Career building: one floor per role, oldest at street level, each floor as deep as the role lasted."
            rest={rest}
            tall={
              <TowerFigure
                labels={labels}
                scene={towerSceneOf(ledger, towerFrames.tall)}
              />
            }
            wide={
              <TowerFigure
                labels={labels}
                scene={towerSceneOf(ledger, towerFrames.wide)}
              />
            }
          />
        }
      />
    </DocumentSection>
  );
};
