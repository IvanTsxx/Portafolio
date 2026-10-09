import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { experiments, getExperiment } from "@/lib/lab/experiments";

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

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="border-rule flex flex-col gap-4 border-t pt-5">
    <h2 className="label text-faint">{title}</h2>
    {children}
  </section>
);

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
    <article className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-4 py-12 md:px-6 md:py-16">
      <Link
        className="label text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
        href="/lab"
      >
        <ArrowLeftIcon aria-hidden className="size-3.5" />
        All experiments
      </Link>

      <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <h1 className="display text-6xl [word-spacing:0.12em] sm:text-7xl lg:col-span-7 lg:text-8xl">
          {experiment.title}
        </h1>
        <div className="flex flex-col gap-5 lg:col-span-5">
          <p className="text-muted-foreground max-w-prose text-base/relaxed text-pretty">
            {experiment.summary}
          </p>
          <dl className="label grid grid-cols-3 gap-4 tabular-nums">
            <div className="flex flex-col gap-1">
              <dt className="text-faint">Index</dt>
              <dd className="text-foreground">{experiment.index}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-faint">Year</dt>
              <dd className="text-foreground">{experiment.year}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-faint">Topics</dt>
              <dd className="text-foreground">
                {experiment.topics.join(" / ")}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <experiment.Preview />

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-12 lg:col-span-7">
          <DetailSection title="About">
            <p className="text-foreground max-w-prose text-lg/relaxed text-pretty">
              {experiment.description}
            </p>
          </DetailSection>
          <DetailSection title="Implementation">
            <ol className="flex max-w-prose flex-col gap-4">
              {experiment.implementation.map((step, stepIndex) => (
                <li className="grid grid-cols-[2rem_1fr] gap-2" key={step}>
                  <span className="label text-faint pt-1 tabular-nums">
                    {(stepIndex + 1).toString().padStart(2, "0")}
                  </span>
                  <p className="text-muted-foreground text-sm/relaxed text-pretty">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </DetailSection>
        </div>
        <aside className="flex flex-col gap-12 lg:col-span-4 lg:col-start-9">
          <DetailSection title="Technical notes">
            <ul className="flex flex-col gap-3">
              {experiment.technicalNotes.map((note) => (
                <li
                  className="text-muted-foreground text-sm/relaxed text-pretty"
                  key={note}
                >
                  {note}
                </li>
              ))}
            </ul>
          </DetailSection>
          <DetailSection title="Interaction">
            <p className="text-muted-foreground text-sm/relaxed text-pretty">
              {experiment.hasControls
                ? "Use the controls beside the preview. Every control is keyboard accessible and labeled."
                : "No controls. The experiment responds to hover, click and arrow keys directly."}
            </p>
          </DetailSection>
          <DetailSection title="Technologies">
            <ul className="flex flex-wrap gap-2">
              {experiment.technologies.map((technology) => (
                <li
                  className="border-rule-strong text-foreground border px-2 py-1 text-xs"
                  key={technology}
                >
                  {technology}
                </li>
              ))}
            </ul>
          </DetailSection>
          <DetailSection title="Source">
            {experiment.sourceUrl ? (
              <a
                className="text-foreground hover:text-clay decoration-rule-strong flex w-fit items-center gap-2 text-sm underline underline-offset-4 transition-colors"
                href={experiment.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                View source
                <ArrowUpRightIcon aria-hidden className="size-3.5" />
              </a>
            ) : (
              <p className="text-faint text-sm">Source not published yet.</p>
            )}
          </DetailSection>
        </aside>
      </div>

      {related.length > 0 ? (
        <DetailSection title="Related experiments">
          <ul className="bg-rule border-rule grid gap-px border md:grid-cols-2">
            {related.map((entry) => (
              <li className="min-w-0" key={entry.slug}>
                <ExperimentCard experiment={entry} />
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}
    </article>
  );
};

export default ExperimentPage;
