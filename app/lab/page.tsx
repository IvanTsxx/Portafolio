import type { Metadata } from "next";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { LabArchive, LabTopicFilter } from "@/components/lab/lab-archive";
import {
  CompactDossier,
  DossierPanel,
} from "@/components/site/compact-dossier";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentLayout } from "@/components/site/document-layout";
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
  <DocumentLayout
    dossier={
      <CompactDossier code="LAB-02">
        <DossierPanel jp="絞込" label="Filter">
          <LabTopicFilter topics={topicCounts} total={experiments.length} />
        </DossierPanel>
      </CompactDossier>
    }
    dossierLabel="Lab filters"
    hero={
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
    }
  >
    <LabArchive items={items} />
  </DocumentLayout>
);

export default LabPage;
