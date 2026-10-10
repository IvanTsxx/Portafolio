import type { Metadata } from "next";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { LabArchive } from "@/components/lab/lab-archive";
import { DocumentHero } from "@/components/site/document-hero";
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

const LabPage = () => (
  <>
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
    <LabArchive items={items} />
  </>
);

export default LabPage;
