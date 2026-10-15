import { DocumentSection } from "@/components/site/document-section";
import type { ContributionCalendar } from "@/lib/github/model";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

import { ContributionGraph } from "./contribution-graph";
import { contributionsText, graphSourcesOf } from "./contribution-model";
import type { GraphSource } from "./contribution-model";

const captionOf = (latest: GraphSource) =>
  `A grid of days by week, darker where there were more contributions. ${contributionsText(latest.total)} ${
    latest.range === "last-year" ? "in the last year" : `in ${latest.year}`
  }.`;

export const MatrixSection = ({
  calendars,
}: {
  calendars: readonly ContributionCalendar[];
}) => {
  const [head, ...rest] = graphSourcesOf(calendars);
  if (!head) {
    return null;
  }
  const sources = [head, ...rest] as const;
  const initial = sources.length - 1;
  const section = homeSectionById("matrix");

  return (
    <DocumentSection
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeMatrix}
    >
      <ContributionGraph
        caption={captionOf(sources[initial] ?? head)}
        initial={initial}
        label="Contributions by day. Arrow keys move between days, Home and End jump to the first and latest day."
        sources={sources}
      />
    </DocumentSection>
  );
};
