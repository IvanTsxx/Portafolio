import { ExperimentCard } from "@/components/lab/experiment-card";
import { LabArchive, LabTopicFilter } from "@/components/lab/lab-archive";
import { DocumentHero } from "@/components/site/document-hero";
import { JsonLd } from "@/components/site/json-ld";
import { PlatePage } from "@/components/site/plate-page";
import { activeTopics, experiments } from "@/lib/lab/experiments";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { experimentsIndexJsonLd } from "@/lib/site/structured-data";

export const metadata = buildPageMetadata(pageSeo.experiments);

const pad = (value: number) => String(value).padStart(2, "0");

const topicCounts = activeTopics.map((topic) => ({
  count: experiments.filter((experiment) => experiment.topics.includes(topic))
    .length,
  topic,
}));

const items = experiments.map((experiment) => ({
  card: <ExperimentCard experiment={experiment} />,
  slug: experiment.slug,
  topics: experiment.topics,
}));

const ExperimentsPage = () => (
  <>
    <JsonLd data={experimentsIndexJsonLd(experiments)} />
    <PlatePage
      plate={
        <DocumentHero
          code="Index · Lab"
          lede="Small experiments in rendering, interaction and creative code. Built to explore, documented to share. Reusable ones install with the shadcn CLI."
          meta={[
            { label: "Entries", value: pad(experiments.length) },
            { label: "Topics", value: pad(activeTopics.length) },
          ]}
          title={
            <>
              The <em>lab</em>
            </>
          }
        />
      }
    >
      <div>
        <LabTopicFilter topics={topicCounts} total={experiments.length} />
      </div>
      <LabArchive items={items} />
    </PlatePage>
  </>
);

export default ExperimentsPage;
