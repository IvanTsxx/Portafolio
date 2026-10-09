import { notFound } from "next/navigation";

import { renderOgImage } from "@/lib/content/og-image";
import { getProject, getProjectSlugs } from "@/lib/content/work";

export const alt = "Case study";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export const generateStaticParams = async () => {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
};

const WorkOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const document = await getProject(slug);
  if (!document) {
    notFound();
  }
  const { entry: project } = document;
  return renderOgImage({
    eyebrow: `Work · ${project.year} · ${project.role}`,
    sample: project.sample,
    title: project.title,
  });
};

export default WorkOpenGraphImage;
