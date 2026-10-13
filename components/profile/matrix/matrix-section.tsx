import "@/components/iso/iso.css";
import { DocumentSection } from "@/components/site/document-section";
import type { ContributionCalendar } from "@/lib/github/model";
import { sectionScripts } from "@/lib/site/section-scripts";

import { loomParts } from "./loom-art";
import { loomArtOf } from "./loom-geometry";
import { loomLayoutOf } from "./loom-layout";
import { LoomLive } from "./loom-live";
import {
  contributionsText,
  loomSourcesOf,
  loomYearOf,
  weekCountOf,
} from "./loom-model";
import type { LoomYear } from "./loom-model";

const captionOf = (weekCount: number, latest: LoomYear | undefined) => {
  const machine = `A pin loom with one pin per day across ${weekCount} weeks, each raised by that day's contributions.`;
  return latest
    ? `${machine} ${contributionsText(latest.total)} ${latest.caption}.`
    : machine;
};

export const MatrixSection = ({
  calendars,
}: {
  calendars: readonly ContributionCalendar[];
}) => {
  const [head, ...rest] = loomSourcesOf(calendars);
  if (!head) {
    return null;
  }
  const sources = [head, ...rest] as const;
  const weekCount = weekCountOf(calendars);
  const years = sources.map(loomYearOf);
  const tallest = Math.max(0, ...years.flatMap((year) => year.heights));
  const initial = Math.max(0, years.length - 1);
  const layout = loomLayoutOf(weekCount, tallest);
  const art = loomArtOf(
    layout,
    sources.map((source) => source.year)
  );

  return (
    <DocumentSection
      id="matrix"
      index="GH-05"
      label="Contribution matrix"
      script={sectionScripts.homeMatrix}
    >
      <LoomLive
        caption={captionOf(weekCount, years[initial])}
        initial={initial}
        label={`Pin loom, ${years.length} years of contributions. Arrow keys read each day, Home and End jump, Enter pins the week, Page Up and Page Down change the year.`}
        parts={loomParts(art)}
        sources={sources}
        tallest={tallest}
        weekCount={weekCount}
      />
    </DocumentSection>
  );
};
