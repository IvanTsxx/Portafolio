import { notFound } from "next/navigation";

import { renderOgImage } from "@/lib/content/og-image";
import { getSkill, skills } from "@/lib/skills/skills";

export const alt = "Agent skill";
export { contentType, size } from "@/lib/content/og-image";

export const generateStaticParams = () =>
  skills.map((skill) => ({ slug: skill.name }));

const SkillOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) {
    notFound();
  }
  return renderOgImage({
    eyebrow: skill.metadata?.version
      ? `Skills · Agent skill · v${skill.metadata.version}`
      : "Skills · Agent skill",
    title: skill.name,
  });
};

export default SkillOpenGraphImage;
