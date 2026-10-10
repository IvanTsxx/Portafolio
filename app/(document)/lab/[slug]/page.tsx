import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { ExperimentPanels } from "@/components/page-panels/experiment";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentSection } from "@/components/site/document-section";
import { experiments, getExperiment } from "@/lib/lab/experiments";
import { relatedExperimentsOf } from "@/lib/site/sections";

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
  const related = relatedExperimentsOf(experiment);

  return (
    <>
      <DocumentHero
        back={{ href: "/lab", label: "Lab" }}
        code={experiment.index}
        jp="実験"
        lede={experiment.topics.join(" / ")}
        meta={[{ label: "Year", value: String(experiment.year) }]}
        size="title"
        title={experiment.title}
      >
        <p className="text-graphite max-w-prose text-base text-pretty">
          {experiment.summary}
        </p>
      </DocumentHero>
      <ExperimentPanels slug={slug} />
      <DocumentSection
        id="preview"
        index={`${experiment.index}.1`}
        jp="見本"
        label="Preview"
        waypoint={{ action: "type", role: "builder", side: "left" }}
      >
        <experiment.Preview />
      </DocumentSection>

      <DocumentSection
        aside={pad(experiment.implementation.length)}
        id="implementation"
        index={`${experiment.index}.2`}
        jp="実装"
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
        index={`${experiment.index}.3`}
        jp="注記"
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

      <DocumentSection
        id="stack"
        index={`${experiment.index}.4`}
        jp="技術"
        label="Stack"
      >
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
          index={`${experiment.index}.5`}
          jp="関連"
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
