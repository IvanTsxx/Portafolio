import type { Metadata } from "next";
import { Suspense } from "react";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { LabArchive, LabArchiveFallback } from "@/components/lab/lab-archive";
import { PageHeader } from "@/components/site/page-header";
import { activeTopics, experiments } from "@/lib/lab/experiments";

export const metadata: Metadata = {
  description: "Experiments in shaders, motion, typography, CSS and 3D.",
  title: "Lab",
};

const pad = (value: number) => String(value).padStart(2, "0");

const items = experiments.map((experiment) => ({
  card: <ExperimentCard experiment={experiment} />,
  slug: experiment.slug,
  topics: experiment.topics,
}));

const topicCounts = activeTopics.map((topic) => ({
  count: experiments.filter((experiment) => experiment.topics.includes(topic))
    .length,
  topic,
}));

const LabPage = () => (
  <>
    <PageHeader
      code="LAB-00"
      jp="実験"
      lede="Techniques tested live"
      meta={[
        { label: "Experiments", value: pad(experiments.length) },
        { label: "Topics", value: pad(activeTopics.length) },
      ]}
      title="Lab"
    />
    <Suspense
      fallback={<LabArchiveFallback items={items} topics={topicCounts} />}
    >
      <LabArchive items={items} topics={topicCounts} />
    </Suspense>
  </>
);

export default LabPage;
