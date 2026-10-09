import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import type { Experiment } from "@/lib/lab/experiments";

export const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
  const { Poster } = experiment;
  return (
    <Link
      className="group/card bg-card hover:bg-accent flex h-full flex-col transition-colors duration-200 ease-out lg:h-128"
      href={`/lab/${experiment.slug}`}
    >
      <div className="bg-background grain relative aspect-video overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1">
        <div className="ease-out-expo size-full transition-transform duration-500 pointer-fine:group-hover/card:scale-103">
          <Poster />
        </div>
        <span className="label text-muted-foreground bg-background/80 absolute top-3 left-3 px-2 py-1">
          {experiment.index}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-foreground text-xl font-medium tracking-tight text-balance">
            {experiment.title}
          </h2>
          <ArrowUpRightIcon
            aria-hidden
            className="text-faint group-hover/card:text-foreground ease-out-quart mt-1 size-4 shrink-0 transition-[color,translate] duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
          />
        </div>
        <p className="text-muted-foreground max-w-prose text-sm/relaxed text-pretty">
          {experiment.summary}
        </p>
        <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-2">
          {experiment.topics.map((topic) => (
            <li className="label text-faint" key={topic}>
              {topic}
            </li>
          ))}
          <li className="label text-faint ml-auto tabular-nums">
            {experiment.year}
          </li>
        </ul>
      </div>
    </Link>
  );
};
