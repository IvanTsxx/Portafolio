import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { ExperimentInstall } from "@/components/lab/experiment-install";
import { OriginalToggle } from "@/components/lab/original-view";
import { ReactionBar } from "@/components/reactions/reaction-bar";
import { CopyButton } from "@/components/site/copy-button";
import { DetailFallback } from "@/components/site/detail-fallback";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentSection } from "@/components/site/document-section";
import { JsonLd } from "@/components/site/json-ld";
import { OpenInMenu } from "@/components/site/open-in-menu";
import { PlatePage } from "@/components/site/plate-page";
import { experiments, getExperiment } from "@/lib/lab/experiments";
import { experimentPrompts } from "@/lib/lab/prompts";
import { markdownPathOf } from "@/lib/markdown/paths";
import { relatedExperimentsOf } from "@/lib/site/sections";
import {
  buildPageMetadata,
  experimentPath,
  experimentSeo,
} from "@/lib/site/seo";
import { experimentJsonLd } from "@/lib/site/structured-data";

export const generateStaticParams = () =>
  experiments.map((experiment) => ({ slug: experiment.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/experiments/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  return experiment ? buildPageMetadata(experimentSeo(experiment)) : {};
};

const pad = (value: number) => String(value).padStart(2, "0");

const ExperimentContent = async ({
  params,
}: Pick<PageProps<"/experiments/[slug]">, "params">) => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    notFound();
  }
  const related = relatedExperimentsOf(experiment);
  const prompt = experimentPrompts[experiment.slug];
  const offset = experiment.registryItem ? 1 : 0;
  const sectionIndex = (position: number) =>
    `${experiment.index}.${position + (position > 1 ? offset : 0)}`;

  return (
    <>
      <JsonLd data={experimentJsonLd(experiment)} />
      <PlatePage
        plate={
          <DocumentHero
            back={{ href: "/experiments", label: "Lab" }}
            code={experiment.index}
            lede={experiment.topics.join(" / ")}
            meta={[{ label: "Year", value: String(experiment.year) }]}
            size="title"
            title={experiment.title}
          >
            <p className="text-muted-foreground max-w-prose text-base text-pretty">
              {experiment.summary}
            </p>
            <OpenInMenu
              markdownPath={markdownPathOf(experimentPath(experiment.slug))}
            />
            <ReactionBar slug={experiment.slug} />
          </DocumentHero>
        }
      >
        <DocumentSection
          aside={
            experiment.hasOriginal === false ? undefined : <OriginalToggle />
          }
          id="preview"
          index={`${experiment.index}.1`}
          label="Preview"
        >
          <experiment.Preview />
        </DocumentSection>

        {experiment.registryItem ? (
          <DocumentSection
            aside="shadcn"
            id="install"
            index={`${experiment.index}.2`}
            label="Install"
          >
            <ExperimentInstall name={experiment.registryItem} />
          </DocumentSection>
        ) : null}

        <DocumentSection id="prompt" index={sectionIndex(2)} label="Prompt">
          <div className="border-border-strong bg-popover flex flex-col border">
            <div className="border-border-strong flex flex-wrap items-center justify-between gap-4 border-b px-5 py-3">
              <p className="label text-muted-foreground">
                Paste into any agent. Point it at an image, component or
                section.
              </p>
              <CopyButton label="Copy prompt" text={prompt} />
            </div>
            <pre className="text-muted-foreground max-h-96 overflow-auto px-5 py-4 font-mono text-xs/relaxed whitespace-pre-wrap">
              {prompt}
            </pre>
          </div>
        </DocumentSection>

        <DocumentSection
          aside={pad(experiment.implementation.length)}
          id="implementation"
          index={sectionIndex(3)}
          label="Implementation"
        >
          <ol className="flex max-w-prose flex-col">
            {experiment.implementation.map((step, stepIndex) => (
              <li
                className="border-border grid grid-cols-[3rem_1fr] gap-2 border-b border-dotted py-4"
                key={step}
              >
                <span className="label text-faint pt-0.5 tabular-nums">
                  [ {pad(stepIndex + 1)} ]
                </span>
                <p className="text-muted-foreground text-sm/relaxed text-pretty">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </DocumentSection>

        <DocumentSection
          aside={pad(experiment.technicalNotes.length)}
          id="notes"
          index={sectionIndex(4)}
          label="Notes"
        >
          <ul className="flex max-w-prose flex-col">
            {experiment.technicalNotes.map((note) => (
              <li
                className="border-border text-muted-foreground flex gap-3 border-b border-dotted py-3 text-sm/relaxed text-pretty"
                key={note}
              >
                <span
                  aria-hidden
                  className="bg-foreground mt-2 size-1.5 shrink-0"
                />
                {note}
              </li>
            ))}
          </ul>
        </DocumentSection>

        <DocumentSection id="stack" index={sectionIndex(5)} label="Stack">
          <ul className="label text-foreground flex flex-wrap gap-x-6 gap-y-2">
            {experiment.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </DocumentSection>

        {related.length > 0 ? (
          <DocumentSection
            aside={pad(related.length)}
            id="related"
            index={sectionIndex(6)}
            label="Related"
          >
            <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
              {related.map((entry) => (
                <li className="min-w-0" key={entry.slug}>
                  <ExperimentCard experiment={entry} />
                </li>
              ))}
            </ul>
          </DocumentSection>
        ) : null}
      </PlatePage>
    </>
  );
};

const ExperimentPage = ({ params }: PageProps<"/experiments/[slug]">) => (
  <Suspense fallback={<DetailFallback />}>
    <ExperimentContent params={params} />
  </Suspense>
);

export default ExperimentPage;
