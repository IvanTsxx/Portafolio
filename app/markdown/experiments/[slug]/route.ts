import { experiments, getExperiment } from "@/lib/lab/experiments";
import { experimentMarkdown } from "@/lib/markdown/documents";
import { markdownResponse } from "@/lib/markdown/response";
import { experimentPath } from "@/lib/site/seo";

export const generateStaticParams = () =>
  experiments.map((experiment) => ({ slug: experiment.slug }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/markdown/experiments/[slug]">
) => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    return new Response("Not found", { status: 404 });
  }
  return markdownResponse(experimentMarkdown(experiment), {
    canonicalPath: experimentPath(slug),
  });
};
