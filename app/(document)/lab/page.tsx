import { ExperimentCard } from "@/components/lab/experiment-card";
import { LabArchive, LabTopicFilter } from "@/components/lab/lab-archive";
import { DocumentHero } from "@/components/site/document-hero";
import { FilterFold } from "@/components/site/filter-fold";
import { JsonLd } from "@/components/site/json-ld";
import { activeTopics, experiments } from "@/lib/lab/experiments";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { labIndexJsonLd } from "@/lib/site/structured-data";

export const metadata = buildPageMetadata(pageSeo.lab);

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

const LabPage = () => (
  <>
    <JsonLd data={labIndexJsonLd(experiments)} />
    <DocumentHero
      code="LAB-01"
      jp="実験"
      lede="Techniques tested live"
      meta={[
        { label: "Experiments", value: pad(experiments.length) },
        { label: "Topics", value: pad(activeTopics.length) },
      ]}
      title="Lab"
    />
    <FilterFold index="LAB-02">
      <LabTopicFilter topics={topicCounts} total={experiments.length} />
    </FilterFold>
    <LabArchive items={items} />
  </>
);

export default LabPage;
