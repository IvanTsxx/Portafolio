import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import type { PinnedRepository } from "@/lib/github/model";
import { loadTimeline } from "@/lib/timeline/timeline";

import { TimelineStage } from "./timeline-stage";

export const TimelineSection = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const timeline = loadTimeline(repositories);

  return (
    <DocumentSection
      aside={
        <PanelCount
          current={timeline.entries.length}
          total={timeline.entries.length}
        />
      }
      id="timeline"
      index="GH-03"
      jp="年表"
      label="Timeline"
    >
      <TimelineStage timeline={timeline} />
    </DocumentSection>
  );
};
