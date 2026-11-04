import { notFound } from "next/navigation";

import { renderOgImage } from "@/lib/content/og-image";
import {
  formatSkillIndex,
  getSkill,
  getSkillIndex,
  skills,
} from "@/lib/skills/skills";

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
    label: {
      code: formatSkillIndex(getSkillIndex(skill.name)),
      meta: "Agent skill",
    },
    summary: skill.description,
    title: { text: skill.name },
  });
};

export default SkillOpenGraphImage;
