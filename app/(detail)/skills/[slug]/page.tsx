import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentHero } from "@/components/site/document-hero";
import { DocumentSection } from "@/components/site/document-section";
import { JsonLd } from "@/components/site/json-ld";
import { NeighborNav } from "@/components/site/neighbor-link";
import { OpenInMenu } from "@/components/site/open-in-menu";
import { SkillBody } from "@/components/skills/skill-body";
import { SkillFiles } from "@/components/skills/skill-files";
import { SkillInstall } from "@/components/skills/skill-install";
import { markdownPathOf } from "@/lib/markdown/paths";
import { sectionScripts } from "@/lib/site/section-scripts";
import { skillSections } from "@/lib/site/sections";
import type { SkillSectionId } from "@/lib/site/sections";
import { buildPageMetadata, skillPath, skillSeo } from "@/lib/site/seo";
import { skillJsonLd } from "@/lib/site/structured-data";
import {
  formatSkillIndex,
  getSkill,
  getSkillIndex,
  skills,
} from "@/lib/skills/skills";
import type { Skill } from "@/lib/skills/skills";

export const generateStaticParams = () =>
  skills.map((skill) => ({ slug: skill.name }));

export const generateMetadata = async ({
  params,
}: PageProps<"/skills/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) {
    return {};
  }
  return buildPageMetadata(skillSeo(skill));
};

const skillNeighbor = (position: number) => {
  const skill = skills[position];
  return skill ? { href: skillPath(skill.name), title: skill.name } : undefined;
};

const metaOf = (skill: Skill) =>
  [
    { label: "Version", value: skill.metadata?.version },
    { label: "Author", value: skill.metadata?.author },
    { label: "License", value: skill.license },
  ].flatMap(({ label, value }) => (value ? [{ label, value }] : []));

const SkillPage = async ({ params }: PageProps<"/skills/[slug]">) => {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) {
    notFound();
  }

  const position = getSkillIndex(skill.name);
  const code = formatSkillIndex(position);

  const sectionProps = (id: SkillSectionId) => {
    const number = skillSections.findIndex((entry) => entry.id === id) + 1;
    return {
      id,
      index: `${code}.${String(number).padStart(2, "0")}`,
      label: skillSections[number - 1]?.label ?? id,
    };
  };

  return (
    <>
      <JsonLd data={skillJsonLd(skill)} />
      <DocumentHero
        back={{ href: "/skills", label: "Skills" }}
        code={code}
        lede="Agent skill"
        meta={metaOf(skill)}
        size="title"
        title={skill.name}
      >
        <p className="text-graphite max-w-prose text-base text-pretty">
          {skill.description}
        </p>
        <OpenInMenu markdownPath={markdownPathOf(skillPath(skill.name))} />
      </DocumentHero>
      <DocumentSection {...sectionProps("installation")}>
        <SkillInstall name={skill.name} />
      </DocumentSection>
      <DocumentSection
        {...sectionProps("instructions")}
        script={sectionScripts.skillInstructions}
      >
        <SkillBody body={skill.body} />
      </DocumentSection>
      <DocumentSection
        {...sectionProps("files")}
        aside={String(skill.files.length).padStart(2, "0")}
      >
        <SkillFiles skill={skill} />
      </DocumentSection>
      <NeighborNav
        label="More skills"
        next={skillNeighbor(position + 1)}
        previous={skillNeighbor(position - 1)}
      />
    </>
  );
};

export default SkillPage;
