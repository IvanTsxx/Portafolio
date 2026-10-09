import type { Metadata } from "next";
import { Suspense } from "react";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { LabArchive, LabArchiveFallback } from "@/components/lab/lab-archive";
import { activeTopics, experiments } from "@/lib/lab/experiments";

export const metadata: Metadata = {
  description:
    "Experiments in shaders, motion, typography, CSS and 3D on the web. Each one is live, with its controls, notes and implementation details.",
  title: "Lab",
};

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
  <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 py-16 md:px-6 md:py-24">
    <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <h1 className="display text-7xl sm:text-8xl lg:col-span-7 lg:text-9xl">
        Lab
      </h1>
      <div className="flex flex-col gap-4 lg:col-span-5">
        <p className="text-muted-foreground max-w-prose text-base/relaxed text-pretty">
          Where techniques get tested before they reach client work. Shaders,
          variable type, CSS that replaces JavaScript, instanced 3D. Every
          experiment runs live on its own page, with controls and notes on how
          it was built.
        </p>
        <dl className="label text-faint flex gap-6 tabular-nums">
          <div className="flex gap-2">
            <dt>Experiments</dt>
            <dd className="text-foreground">
              {experiments.length.toString().padStart(2, "0")}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>Topics</dt>
            <dd className="text-foreground">
              {activeTopics.length.toString().padStart(2, "0")}
            </dd>
          </div>
        </dl>
      </div>
    </header>
    <Suspense
      fallback={<LabArchiveFallback items={items} topics={topicCounts} />}
    >
      <LabArchive items={items} topics={topicCounts} />
    </Suspense>
  </div>
);

export default LabPage;
