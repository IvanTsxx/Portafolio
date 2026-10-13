import { notFound } from "next/navigation";

import { renderOgImage } from "@/lib/content/og-image";
import { experiments, getExperiment } from "@/lib/lab/experiments";

export const alt = "Lab experiment";
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
    eyebrow: `Lab · ${experiment.index} · ${experiment.topics.join(" / ")}`,
    title: experiment.title,
  });
};

export default ExperimentOpenGraphImage;
