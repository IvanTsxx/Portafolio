import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { SampleBadge } from "@/components/content/sample-badge";
import type { WorkIndexItem } from "@/lib/content/work";

const visibleTechnologyCount = 3;

export const WorkRow = ({
  index,
  project,
}: {
  index: string;
  project: WorkIndexItem;
}) => {
  const hiddenTechnologyCount = Math.max(
    0,
    project.technologies.length - visibleTechnologyCount
  );

  return (
    <li className="group border-rule hover:bg-card has-[a:focus-visible]:outline-clay relative border-b transition-colors has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2">
      <div className="grid gap-x-4 gap-y-3 px-4 py-6 md:px-6 lg:grid-cols-12 lg:items-baseline">
        <div className="label group-hover:text-clay flex gap-4 transition-colors lg:contents">
          <span className="text-muted-foreground tabular-nums lg:col-span-1">
            {index}
          </span>
          <span className="text-muted-foreground tabular-nums lg:col-span-1">
            {project.year}
          </span>
        </div>
        <div className="flex flex-col items-start gap-3 lg:col-span-4">
          <h2 className="display text-foreground w-full text-4xl lg:text-5xl">
            <Link
              className="flex items-start justify-between gap-4 outline-none after:absolute after:inset-0"
              href={`/work/${project.slug}`}
            >
              <span>{project.title}</span>
              <ArrowUpRight
                aria-hidden
                className="text-clay ease-out-quart mt-1 hidden size-6 shrink-0 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-has-[a:focus-visible]:translate-x-0 group-has-[a:focus-visible]:opacity-100 lg:block"
              />
            </Link>
          </h2>
          {project.sample ? (
            <SampleBadge source={`content/work/${project.slug}.mdx`} />
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm lg:col-span-2">
          {project.context}
        </p>
        <p className="text-muted-foreground text-sm lg:col-span-2">
          {project.role}
        </p>
        <p className="label text-muted-foreground hidden lg:col-span-2 lg:block">
          {project.technologies.slice(0, visibleTechnologyCount).join(", ")}
          {hiddenTechnologyCount > 0 ? (
            <span className="tabular-nums"> +{hiddenTechnologyCount}</span>
          ) : null}
        </p>
        <div className="ease-out-quart grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-300 lg:col-span-12 pointer-fine:lg:grid-rows-[0fr] pointer-fine:lg:opacity-0 pointer-fine:lg:group-hover:grid-rows-[1fr] pointer-fine:lg:group-hover:opacity-100 pointer-fine:lg:group-has-[a:focus-visible]:grid-rows-[1fr] pointer-fine:lg:group-has-[a:focus-visible]:opacity-100">
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-4 pt-2 lg:grid-cols-12">
              <p className="text-foreground/90 max-w-prose text-base/7 text-pretty lg:col-span-6 lg:col-start-3">
                {project.summary}
              </p>
              <ul className="label text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 lg:col-span-4 lg:col-start-9 lg:justify-end">
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
