import { markdownResponse } from "@/lib/markdown/response";
import { skillPath } from "@/lib/site/seo";
import { getSkill, readSkillSource, skills } from "@/lib/skills/skills";

export const generateStaticParams = () =>
  skills.map((skill) => ({ slug: skill.name }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/markdown/skills/[slug]">
) => {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) {
    return new Response("Not found", { status: 404 });
  }
  return markdownResponse(readSkillSource(skill), {
    canonicalPath: skillPath(slug),
  });
};
