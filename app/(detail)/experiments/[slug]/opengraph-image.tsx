import { notFound } from "next/navigation";

import { renderOgImage } from "@/lib/content/og-image";
import { experiments, getExperiment } from "@/lib/lab/experiments";

export const alt = "Experiment";
export { contentType, size } from "@/lib/content/og-image";

export const generateStaticParams = () =>
  experiments.map((experiment) => ({ slug: experiment.slug }));

const ExperimentOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    notFound();
  }
  return renderOgImage({
    figure: { kind: "poster", slug: experiment.slug },
    label: { code: experiment.index, meta: experiment.topics.join(" / ") },
    summary: experiment.summary,
    title: { text: experiment.title },
  });
};

export default ExperimentOpenGraphImage;
