import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { OriginalToggle } from "@/components/lab/original-view";
import { CopyButton } from "@/components/site/copy-button";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentSection } from "@/components/site/document-section";
import { JsonLd } from "@/components/site/json-ld";
import { OpenInMenu } from "@/components/site/open-in-menu";
import { experiments, getExperiment } from "@/lib/lab/experiments";
import { experimentPrompts } from "@/lib/lab/prompts";
import { markdownPathOf } from "@/lib/markdown/paths";
import { sectionScripts } from "@/lib/site/section-scripts";
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

const ExperimentPage = async ({ params }: PageProps<"/experiments/[slug]">) => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    notFound();
  }
  const related = relatedExperimentsOf(experiment);
  const prompt = experimentPrompts[experiment.slug];

  return (
    <>
      <JsonLd data={experimentJsonLd(experiment)} />
      <DocumentHero
        back={{ href: "/experiments", label: "Experiments" }}
        code={experiment.index}
        lede={experiment.topics.join(" / ")}
        meta={[{ label: "Year", value: String(experiment.year) }]}
        size="title"
        title={experiment.title}
      >
        <p className="text-graphite max-w-prose text-base text-pretty">
          {experiment.summary}
        </p>
        <OpenInMenu
          markdownPath={markdownPathOf(experimentPath(experiment.slug))}
        />
      </DocumentHero>
      <DocumentSection
        aside={<OriginalToggle />}
        id="preview"
        index={`${experiment.index}.1`}
        label="Preview"
        script={sectionScripts.labPreview}
      >
        <experiment.Preview />
      </DocumentSection>

      <DocumentSection
        id="prompt"
        index={`${experiment.index}.2`}
        label="Prompt"
      >
        <div className="border-rule-strong bg-popover flex flex-col border">
          <div className="border-rule-strong flex flex-wrap items-center justify-between gap-4 border-b px-5 py-3">
            <p className="label text-graphite">
              Paste into any agent. Point it at an image, component or section.
            </p>
            <CopyButton label="Copy prompt" text={prompt} />
          </div>
          <pre className="text-graphite max-h-96 overflow-auto px-5 py-4 font-mono text-xs/relaxed whitespace-pre-wrap">
            {prompt}
          </pre>
        </div>
      </DocumentSection>

      <DocumentSection
        aside={pad(experiment.implementation.length)}
        id="implementation"
        index={`${experiment.index}.3`}
        label="Implementation"
      >
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
      </DocumentSection>

      <DocumentSection
        aside={pad(experiment.technicalNotes.length)}
        id="notes"
        index={`${experiment.index}.4`}
        label="Notes"
      >
        <ul className="flex max-w-prose flex-col">
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
      </DocumentSection>

      <DocumentSection id="stack" index={`${experiment.index}.5`} label="Stack">
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
      </DocumentSection>

      {related.length > 0 ? (
        <DocumentSection
          aside={pad(related.length)}
          id="related"
          index={`${experiment.index}.6`}
          label="Related"
        >
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
        </DocumentSection>
      ) : null}
    </>
  );
};

export default ExperimentPage;
