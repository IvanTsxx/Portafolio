import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { SampleBadge } from "@/components/content/sample-badge";
import { AgentSpot } from "@/components/scene/agent-spot";
import { agentSpots } from "@/components/site/agent-spots";
import { CornerMarks } from "@/components/site/corner-marks";
import { hoverRowClassName } from "@/components/site/styles";
import type { WorkIndexItem } from "@/lib/content/work";
import { cn } from "@/lib/utils";

const visibleTechnologyCount = 3;

export const WorkRow = ({
  index,
  project,
  spot = false,
}: {
  index: string;
  project: WorkIndexItem;
  spot?: boolean;
}) => {
  const hiddenTechnologyCount = Math.max(
    0,
    project.technologies.length - visibleTechnologyCount
  );

  return (
    <li
      className={cn(
        "group/marks border-rule relative border-b",
        hoverRowClassName
      )}
    >
      <CornerMarks reveal="hover" />
      {spot ? <AgentSpot {...agentSpots.architectRow} /> : null}
      <div className="grid gap-x-4 gap-y-3 p-4 md:p-5 lg:grid-cols-12 lg:items-baseline">
        <div className="label text-mist flex gap-4 tabular-nums lg:contents">
          <span className="lg:col-span-1">{index}</span>
          <span className="lg:col-span-1">{project.year}</span>
        </div>
        <div className="flex flex-col items-start gap-3 lg:col-span-4">
          <h2 className="display text-ink w-full text-3xl lg:text-4xl">
            <Link
              className="flex items-start justify-between gap-4 outline-none after:absolute after:inset-0"
              href={`/work/${project.slug}`}
            >
              <span>{project.title}</span>
              <ArrowUpRight
                aria-hidden
                className="text-ink ease-out-quart mt-1 hidden size-6 shrink-0 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-focus-within/marks:translate-x-0 group-focus-within/marks:opacity-100 group-hover/marks:translate-x-0 group-hover/marks:opacity-100 lg:block"
              />
            </Link>
          </h2>
          <p className="text-graphite text-sm text-pretty">{project.summary}</p>
          {project.sample ? (
            <SampleBadge source={`content/work/${project.slug}.mdx`} />
          ) : null}
        </div>
        <p className="text-graphite text-sm lg:col-span-2">{project.context}</p>
        <p className="text-graphite text-sm lg:col-span-2">{project.role}</p>
        <p className="label text-graphite lg:col-span-2">
          {project.technologies.slice(0, visibleTechnologyCount).join(", ")}
          {hiddenTechnologyCount > 0 ? (
            <span className="text-mist tabular-nums">
              {" "}
              +{String(hiddenTechnologyCount).padStart(2, "0")}
            </span>
          ) : null}
        </p>
      </div>
    </li>
  );
};
