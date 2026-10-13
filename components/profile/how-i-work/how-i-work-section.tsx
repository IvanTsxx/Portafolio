import "@/components/iso/iso.css";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { workSteps } from "@/lib/site/practice";
import { sectionScripts } from "@/lib/site/section-scripts";

import { lineDrawing } from "./line-art";
import { LineLive } from "./line-live";

export const HowIWork = () => {
  const count = workSteps.length;
  return (
    <DocumentSection
      aside={<PanelCount current={count} total={count} />}
      id="how-i-work"
      index="GH-06"
      jp="仕事の流儀"
      label="How I work"
      script={sectionScripts.homeHowIWork}
    >
      <LineLive
        caption={`A rotary indexing table with ${count} stations, one per step of the work. Every nest carries one issue in its own worktree. Each cycle all ${count} stations work at once, then the table turns 60° and every issue moves on one step. The lit part is the one being followed; it leaves the table only through Review, where the hand press is mine.`}
        drawing={lineDrawing()}
        label={`Indexing table, ${count} workflow steps. Arrow keys send the followed part to a step; Escape lets the line run again.`}
      />
    </DocumentSection>
  );
};
