import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { BlueprintFigure } from "@/components/home/blueprint-figure";
import {
  CornerMarks,
  HomeSectionShell,
  SampleTag,
  SectionHeading,
} from "@/components/home/primitives";
import { getProjects } from "@/lib/content/work";
import type { WorkProject } from "@/lib/content/work";
import { blueprintSequence } from "@/lib/home/content";
import type { BlueprintKind } from "@/lib/home/content";
import { cn } from "@/lib/utils";

const featuredBuildCount = 3;
const stackPreviewCount = 4;
const buildNoteCount = 3;

interface BuildPanelProject {
  blueprint: BlueprintKind;
  buildNotes: readonly string[];
  code: string;
  role: string;
  sample: boolean;
  slug: string;
  stack: readonly string[];
  summary: string;
  title: string;
  year: number;
}

const toBuildPanelProject = (
  project: WorkProject,
  position: number
): BuildPanelProject => ({
  blueprint: blueprintSequence[position % blueprintSequence.length] ?? "system",
  buildNotes: project.responsibilities.slice(0, buildNoteCount),
  code: `BLD-${String(position + 1).padStart(2, "0")}`,
  role: project.role,
  sample: project.sample,
  slug: project.slug,
  stack: project.technologies.slice(0, stackPreviewCount),
  summary: project.summary,
  title: project.title,
  year: project.year,
});

const pickFeaturedBuilds = (projects: readonly WorkProject[]) =>
  [
    ...projects.filter((project) => project.featured),
    ...projects.filter((project) => !project.featured),
  ]
    .slice(0, featuredBuildCount)
    .map(toBuildPanelProject);

const BuildPanel = ({
  project,
  featured,
}: {
  project: BuildPanelProject;
  featured: boolean;
}) => (
  <Link
    className="group border-rule bg-card/40 hover:border-rule-strong focus-visible:border-clay relative flex h-full flex-col border transition-colors"
    href={`/work/${project.slug}`}
  >
    <div className="border-rule flex items-center justify-between gap-4 border-b px-4 py-3">
      <span className="label text-muted-foreground">
        {project.code} · {project.year}
      </span>
      {project.sample ? <SampleTag /> : null}
    </div>
    <div
      className={cn(
        "blueprint-grid border-rule relative border-b",
        featured ? "aspect-16/9" : "aspect-2/1"
      )}
    >
      <CornerMarks />
      <div className="ease-out-quart absolute inset-6 transition-transform duration-500 group-hover:scale-102">
        <BlueprintFigure kind={project.blueprint} />
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-6">
        <h3 className={cn("display", featured ? "text-5xl" : "text-4xl")}>
          {project.title}
        </h3>
        <ArrowUpRightIcon
          aria-hidden
          className="text-faint group-hover:text-clay ease-out-quart mt-1 size-5 shrink-0 transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <p className="text-muted-foreground max-w-lg text-sm text-pretty">
        {project.summary}
      </p>
      <dl className="border-rule mt-auto grid grid-cols-2 gap-4 border-t pt-4">
        <div className="flex flex-col gap-1">
          <dt className="label text-faint">Role</dt>
          <dd className="text-sm">{project.role}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="label text-faint">Stack</dt>
          <dd className="text-sm">{project.stack.join(", ")}</dd>
        </div>
        {featured ? (
          <div className="col-span-2 flex flex-col gap-2">
            <dt className="label text-faint">Build notes</dt>
            <dd>
              <ul className="flex flex-col gap-1">
                {project.buildNotes.map((note, noteIndex) => (
                  <li
                    className="text-muted-foreground flex gap-3 text-sm"
                    key={note}
                  >
                    <span className="label text-faint tabular-nums">
                      {String(noteIndex + 1).padStart(2, "0")}
                    </span>
                    {note}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  </Link>
);

export const SelectedWork = async () => {
  const [lead, ...rest] = pickFeaturedBuilds(await getProjects());
  if (!lead) {
    return null;
  }
  return (
    <HomeSectionShell className="py-24 md:py-32" id="work">
      <SectionHeading
        aside={
          <Link
            className="label text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-2 transition-colors"
            href="/work"
          >
            All work
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </Link>
        }
        id="work"
        lede="Each build is filed like an inspection sheet: what it is, the stack, and the engineering decisions that held it together."
        title="Selected builds"
      />
      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <li className="md:col-span-2 lg:col-span-7 lg:row-span-2">
          <BuildPanel featured project={lead} />
        </li>
        {rest.map((project) => (
          <li className="lg:col-span-5" key={project.slug}>
            <BuildPanel featured={false} project={project} />
          </li>
        ))}
      </ul>
      <p className="label text-faint mt-6">
        Builds tagged Sample are placeholders until the case studies are
        published.
      </p>
    </HomeSectionShell>
  );
};
