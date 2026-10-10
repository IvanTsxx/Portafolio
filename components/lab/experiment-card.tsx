import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AgentSpot } from "@/components/scene/agent-spot";
import { agentSpots } from "@/components/site/agent-spots";
import { CornerMarks } from "@/components/site/corner-marks";
import { focusRingClassName } from "@/components/site/styles";
import type { Experiment } from "@/lib/lab/experiments";
import { cn } from "@/lib/utils";

export const ExperimentCard = ({
  experiment,
  spot = false,
}: {
  experiment: Experiment;
  spot?: boolean;
}) => {
  const { Poster } = experiment;
  return (
    <Link
      className={cn(
        "group/marks hover:bg-paper-deep/60 ease-mechanical relative flex h-full flex-col transition-colors duration-100 focus-visible:ring-inset lg:h-128",
        focusRingClassName
      )}
      href={`/lab/${experiment.slug}`}
    >
      <CornerMarks reveal="hover" />
      {spot ? <AgentSpot {...agentSpots.debuggerCard} /> : null}
      <div className="border-graphite/30 bg-popover relative aspect-video overflow-hidden border-b lg:aspect-auto lg:min-h-0 lg:flex-1">
        <div className="ease-out-expo size-full transition-transform duration-500 pointer-fine:group-hover/marks:scale-103">
          <Poster />
        </div>
        <span className="label text-ink border-ink bg-paper absolute top-3 left-3 border px-2 py-1 tabular-nums">
          {experiment.index}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-ink text-xl font-light tracking-tight text-balance">
            {experiment.title}
          </h2>
          <ArrowUpRightIcon
            aria-hidden
            className="text-mist group-hover/marks:text-ink ease-out-quart mt-1 size-4 shrink-0 transition-[color,translate] duration-200 group-hover/marks:translate-x-0.5 group-hover/marks:-translate-y-0.5"
          />
        </div>
        <p className="text-graphite max-w-prose text-sm text-pretty">
          {experiment.summary}
        </p>
        <ul className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {experiment.topics.map((topic) => (
            <li
              className="label border-rule-strong text-graphite border px-2 py-1"
              key={topic}
            >
              {topic}
            </li>
          ))}
          <li className="label text-mist ml-auto tabular-nums">
            {experiment.year}
          </li>
        </ul>
      </div>
    </Link>
  );
};
