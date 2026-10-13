import Link from "next/link";

import { CornerMarks } from "@/components/site/corner-marks";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { focusRingClassName } from "@/components/site/styles";
import { experiments } from "@/lib/lab/experiments";
import type { Experiment } from "@/lib/lab/experiments";
import { sectionScripts } from "@/lib/site/section-scripts";
import { cn } from "@/lib/utils";

const newestFirst = experiments.toSorted((first, second) =>
  second.index.localeCompare(first.index)
);

const cellClassName = cn(
  "group/ink group/marks relative flex flex-col",
  focusRingClassName
);

const ExperimentCell = ({ experiment }: { experiment: Experiment }) => {
  const { Poster } = experiment;
  return (
    <li className="border-rule min-w-0 border-r border-b" data-build-block>
      <Link className={cellClassName} href={`/lab/${experiment.slug}`}>
        <CornerMarks reveal="hover" />
        <div className="bg-popover border-rule aspect-video overflow-hidden border-b">
          <Poster />
        </div>
        <div className="flex flex-col gap-1 p-3">
          <span className="label text-mist tabular-nums">
            {experiment.index}
          </span>
          <span className="text-ink truncate text-sm">
            <span className="ink-underline">{experiment.title}</span>
          </span>
          <span className="text-graphite truncate text-xs">
            {experiment.summary}
          </span>
        </div>
      </Link>
    </li>
  );
};

export const ExperimentsSection = () => (
  <DocumentSection
    aside={
      <PanelCount current={experiments.length} total={experiments.length} />
    }
    id="experiments"
    index="GH-08"
    jp="実験"
    label="Experiments"
    script={sectionScripts.homeExperiments}
  >
    <ul className="border-rule grid grid-cols-2 border-t border-l sm:grid-cols-3">
      {newestFirst.map((experiment) => (
        <ExperimentCell experiment={experiment} key={experiment.slug} />
      ))}
      <li className="border-rule border-r border-b" data-build-block>
        <Link
          className={cn(
            cellClassName,
            "label text-ink h-full min-h-32 justify-end p-3"
          )}
          href="/lab"
        >
          <CornerMarks reveal="hover" />
          <span>
            <span className="ink-underline">All experiments</span> →
          </span>
        </Link>
      </li>
    </ul>
  </DocumentSection>
);
