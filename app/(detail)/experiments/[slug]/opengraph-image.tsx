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
    eyebrow: `Experiments · ${experiment.index} · ${experiment.topics.join(" / ")}`,
    title: experiment.title,
  });
};

export default ExperimentOpenGraphImage;
