import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { PanelHeading } from "@/components/site/panel-heading";
import { focusRingClassName, linkClassName } from "@/components/site/styles";
import { experiments, getExperiment } from "@/lib/lab/experiments";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export const generateStaticParams = () =>
  experiments.map((experiment) => ({ slug: experiment.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/lab/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  return experiment
    ? { description: experiment.summary, title: `${experiment.title} · Lab` }
    : {};
};

const pad = (value: number) => String(value).padStart(2, "0");

const ExperimentPage = async ({ params }: PageProps<"/lab/[slug]">) => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    notFound();
  }
  const related = experiment.related
    .map((relatedSlug) => getExperiment(relatedSlug))
    .filter((entry) => entry !== undefined);

  return (
    <article className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 pt-6 pb-8 md:px-8 md:pt-8">
      <header>
        <div className="label border-rule-strong flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b pb-2">
          <Link
            className={cn(
              focusRingClassName,
              "text-ink hover:text-graphite ease-mechanical inline-flex min-h-11 items-center gap-2 transition-colors duration-100 md:min-h-8"
            )}
            href="/lab"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            Lab
          </Link>
          <span className="flex gap-2">
            <span className="text-mist">Doc</span>
            <span className="text-ink tabular-nums">{experiment.index}</span>
          </span>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 md:mt-16 lg:grid-cols-12 lg:items-end">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <h1 className="display text-ink text-5xl [word-spacing:0.12em] sm:text-7xl lg:text-8xl">
              {experiment.title}
            </h1>
            <p className="text-graphite max-w-prose text-base text-pretty">
              {experiment.summary}
            </p>
          </div>
          <LeaderList className="lg:col-span-5">
            <LeaderRow jp="年" label="Year">
              {experiment.year}
            </LeaderRow>
            <LeaderRow jp="分野" label="Topics">
              {experiment.topics.join(" / ")}
            </LeaderRow>
            <LeaderRow jp="操作" label="Controls">
              {experiment.hasControls ? "Panel" : "Direct"}
            </LeaderRow>
            <LeaderRow jp="出典" label="Source">
              {experiment.sourceUrl ? (
                <a
                  className={cn(
                    linkClassName,
                    "inline-flex items-center gap-1"
                  )}
                  href={experiment.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  View
                  <ArrowUpRightIcon aria-hidden className="size-3.5" />
                </a>
              ) : (
                "Unpublished"
              )}
            </LeaderRow>
          </LeaderList>
        </div>
      </header>

      <section aria-labelledby="preview" className="flex flex-col gap-6">
        <PanelHeading
          id="preview"
          index={`${experiment.index}.1`}
          jp="見本"
          label="Preview"
        />
        <experiment.Preview />
      </section>

      <div className="grid gap-x-8 gap-y-16 lg:grid-cols-12">
        <section
          aria-labelledby="implementation"
          className="flex flex-col gap-6 lg:col-span-7"
        >
          <PanelHeading
            aside={pad(experiment.implementation.length)}
            id="implementation"
            index={`${experiment.index}.2`}
            jp="実装"
            label="Implementation"
          />
          <ol className="flex max-w-prose flex-col">
            {experiment.implementation.map((step, stepIndex) => (
              <li
                className="border-rule grid grid-cols-[3rem_1fr] gap-2 border-b border-dotted py-4"
                key={step}
              >
                <span className="label text-mist pt-0.5 tabular-nums">
                  [ {pad(stepIndex + 1)} ]
                </span>
                <p className="text-graphite text-sm/relaxed text-pretty">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <aside className="flex flex-col gap-16 lg:col-span-4 lg:col-start-9">
          <section aria-labelledby="notes" className="flex flex-col gap-6">
            <PanelHeading
              aside={pad(experiment.technicalNotes.length)}
              id="notes"
              index={`${experiment.index}.3`}
              jp="注記"
              label="Notes"
            />
            <ul className="flex flex-col">
              {experiment.technicalNotes.map((note) => (
                <li
                  className="border-rule text-graphite flex gap-3 border-b border-dotted py-3 text-sm/relaxed text-pretty"
                  key={note}
                >
                  <span aria-hidden className="bg-ink mt-2 size-1.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="stack" className="flex flex-col gap-6">
            <PanelHeading
              id="stack"
              index={`${experiment.index}.4`}
              jp="技術"
              label="Stack"
            />
            <ul className="flex flex-wrap gap-2">
              {experiment.technologies.map((technology) => (
                <li
                  className="label border-rule-strong text-ink border px-2 py-1"
                  key={technology}
                >
                  {technology}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related" className="flex flex-col gap-6">
          <PanelHeading
            aside={pad(related.length)}
            id="related"
            index={`${experiment.index}.5`}
            jp="関連"
            label="Related"
          />
          <ul className="border-graphite/30 grid border-t border-l md:grid-cols-2">
            {related.map((entry) => (
              <li
                className="border-graphite/30 min-w-0 border-r border-b"
                key={entry.slug}
              >
                <ExperimentCard experiment={entry} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
};

export default ExperimentPage;
